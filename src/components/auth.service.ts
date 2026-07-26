import { HttpStatus, Injectable } from '@nestjs/common';
import { GrpcErrorResponse, GrpcSuccessResponse } from 'src/app/exceptions/grpc-responses.exception';
import { AppHelper } from 'src/app/helpers/app.helper';
import { NB } from 'src/app/helpers/nb.helper';
import { RedisService } from 'src/app/services/redis/redis.service';
import { DevicesRepository } from 'src/models/repositories/devices.repository';
import { LoginHistoriesRepository } from 'src/models/repositories/login_histories.repository';
import { PasswordHistoriesRepository } from 'src/models/repositories/password_histories.repository';
import { RefreshTokensRepository } from 'src/models/repositories/refresh_tokens.repository';
import { RolesRepository } from 'src/models/repositories/roles.repository';
import { SessionsRepository } from 'src/models/repositories/sessions.repository';
import { UserRolesRepository } from 'src/models/repositories/user_roles.repository';
import { UsersRepository } from 'src/models/repositories/users.repository';

@Injectable()
export class AuthService {

    constructor(

        // REPOSITORIES
        private readonly passwordHistoriesRepo: PasswordHistoriesRepository,
        private readonly loginHistoriesRepo: LoginHistoriesRepository,
        private readonly refreshTokensRep: RefreshTokensRepository,
        private readonly userRolesRepo: UserRolesRepository,
        private readonly sessionsRepo: SessionsRepository,
        private readonly devicesRepo: DevicesRepository,
        private readonly rolesRepo: RolesRepository,
        private readonly usersRepo: UsersRepository,

        // SERVICES
        private readonly redisService: RedisService,

        // HELPER
        private readonly appHelper: AppHelper
    ) { }

    async registerInitiate(operation: string, action: string, data: any) {

        if (!NB.isNoEmpty(data) || !NB.isNoEmpty(data.mobile_number)) {
            return GrpcErrorResponse(HttpStatus.NOT_FOUND, 'Mobile number is required');
        }

        const isAlreadyNumberExist = await this.usersRepo.isAlreadyNumberExist(
            data.mobile_number
        );
        if (isAlreadyNumberExist) {
            return GrpcErrorResponse(
                HttpStatus.BAD_REQUEST,
                'User already exist, Please log in'
            );
        }

        // Prevent users from requesting multiple OTPs within the cooldown period.
        const otpExists = await this.redisService.otpExists("register", data.mobile_number);
        if (otpExists) {
            return GrpcErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS,
                "OTP already sent, please wait before requesting another OTP."
            );
        }

        const otp = this.appHelper.generateOtp();

        const hashedOtp = await this.appHelper.hashedOtp(otp);

        await this.redisService.saveOtp("register", data.mobile_number, hashedOtp);

        //TODO: Invoke Notification Service to deliver OTP via SMS.

        return GrpcSuccessResponse(HttpStatus.OK, 'OTP sent successfully', hashedOtp);
    }

    async registerVerifyOtp(operation: string, action: string, data: any) {

        if (!NB.isNoEmpty(data) || !data.mobile_number || !data.otp) {
            return GrpcErrorResponse(
                HttpStatus.NOT_FOUND,
                'Mobile number and OTP are required'
            );
        }

        // Fetch the stored hashed OTP from Redis
        const storedHashedOtp: any = await this.redisService.getOtp("register", data.mobile_number);
        if (!NB.isNoEmpty(storedHashedOtp)) {
            return GrpcErrorResponse(
                HttpStatus.BAD_REQUEST,
                'OTP has expired or is invalid. Please request a new one.'
            );
        }

        const isOtpValid: any = await this.appHelper.compareOtp(data.otp, storedHashedOtp);
        if (!isOtpValid) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid OTP entered');
        }

        await this.redisService.deleteOtp("register", data.mobile_number);

        // Generate a new signup token and return it to the client
        const token = this.appHelper.generateToken(data.mobile_number, 'registraion_complete');

        return GrpcSuccessResponse(
            HttpStatus.OK,
            'OTP verified successfully',
            {
                mobile_number: data.mobile_number,
                is_verified: true,
                registration_token: token,
            }
        );
    }

    async registerComplete(operation: string, action: string, data: any) {

        if (
            !NB.isNoEmpty(data)
            || !data.registration_token
            || !data.password
            || !data.first_name
            || !data.last_name
        ) {
            return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Missing required profile fields');
        }

        const decodeToken: any = this.appHelper.verifyToken(data.registration_token);
        if (!NB.isNoEmpty(decodeToken) || !decodeToken.mobile_number) {
            return GrpcErrorResponse(
                HttpStatus.UNAUTHORIZED,
                'Session expired. Please verify your OTP again.'
            );
        }

        const verifiedMobileNumber = decodeToken.mobile_number;

        const hashPassword = await this.appHelper.hashPassword(data.password);

        const inserted = await this.usersRepo.createUser({
            first_name: data.first_name,
            last_name: data.last_name,
            mobile_number: verifiedMobileNumber,
            password: hashPassword,
            mobile_verified: 1,
            status: 1
        });

        if (NB.isNoEmpty(inserted) && inserted.id) {

            await this.passwordHistoriesRepo.createPasswordHistory({
                user_id: inserted.id,
                password: hashPassword
            })

            const roleId = await this.rolesRepo.getRoleIdByRoleName('CUSTOMER');
            if (!NB.isNoEmpty(roleId)) {
                return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Role not found');
            }

            await this.userRolesRepo.createUserRole({
                user_id: inserted.id,
                role_id: roleId
            })

            return GrpcSuccessResponse(HttpStatus.OK, 'Registration completed successfully');
        }

        return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Registration failed');
    }

    async login(operation: string, action: string, data: any) {

        if (!NB.isNoEmpty(data) || !data.mobile_number || !data.password) {
            return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Missing required login fields');
        }

        if (!data.device) {
            return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Missing device details');
        }

        const { mobile_number, password, device } = data;

        const user = await this.usersRepo.findByMobileNumber(data.mobile_number);
        if (!NB.isNoEmpty(user)) {
            await this.loginHistoriesRepo.logAttempt({
                user_id: null,
                mobile_number,
                status: 0,
                failure_reason: 'User not found',
                device_name: NB.isNoEmpty(device) ? device.device_name : "",
                user_agent: NB.isNoEmpty(device) ? device.user_agent : "",
                ip_address: NB.isNoEmpty(device) ? device.ip_address : ""
            })
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid credentials');
        }

        if (user.status !== 1) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'User is inactive or suspended');
        }

        const isPasswordValid = await this.appHelper.comparePassword(password, user.password);
        if (!isPasswordValid) {
            await this.loginHistoriesRepo.logAttempt({
                user_id: user.id,
                mobile_number,
                status: 0,
                failure_reason: 'Invalid password',
                device_name: NB.isNoEmpty(device) ? device.device_name : "",
                user_agent: NB.isNoEmpty(device) ? device.user_agent : "",
                ip_address: NB.isNoEmpty(device) ? device.ip_address : ""
            })
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid credentials');
        }

        let savedDevice: any = null;
        if (NB.isNoEmpty(device)) {
            savedDevice = await this.devicesRepo.saveDevice({
                user_id: user.id,
                device_type: NB.isNoEmpty(device) ? device.device_type : "",
                device_name: NB.isNoEmpty(device) ? device.device_name : "",
                os: NB.isNoEmpty(device) ? device.os : "",
                os_version: NB.isNoEmpty(device) ? device.os_version : "",
                browser: NB.isNoEmpty(device) ? device.browser : "",
                browser_version: NB.isNoEmpty(device) ? device.browser_version : "",
                is_trusted: 1
            })

            if (!NB.isNoEmpty(savedDevice) || !savedDevice.id) {
                await this.loginHistoriesRepo.logAttempt({
                    user_id: user.id,
                    mobile_number,
                    status: 0,
                    failure_reason: 'Device registration failed',
                    device_name: NB.isNoEmpty(device) ? device.device_name : "",
                    user_agent: NB.isNoEmpty(device) ? device.user_agent : "",
                    ip_address: NB.isNoEmpty(device) ? device.ip_address : ""
                })
                return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Device registration failed');
            }
        }

        const refreshToken = this.appHelper.generateRefreshToken({ sub: user.id });

        const savedRefreshToken = await this.refreshTokensRep.saveRefreshToken({
            user_id: user.id,
            token: this.appHelper.hashToken(refreshToken),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: 0
        })

        if (!NB.isNoEmpty(savedRefreshToken) || !savedRefreshToken.id) {
            await this.loginHistoriesRepo.logAttempt({
                user_id: user.id,
                mobile_number,
                status: 0,
                failure_reason: 'Refresh token registration failed',
                device_name: NB.isNoEmpty(device) ? device.device_name : "",
                user_agent: NB.isNoEmpty(device) ? device.user_agent : "",
                ip_address: NB.isNoEmpty(device) ? device.ip_address : ""
            })
            return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Refresh token registration failed');
        }

        const savedSession = await this.sessionsRepo.createSession({
            user_id: user.id,
            device_id: (NB.isNoEmpty(savedDevice) && savedDevice.id) ? savedDevice.id : null,
            refresh_token_id: savedRefreshToken.id,
            ip_address: NB.isNoEmpty(device) ? device.ip_address : null,
            user_agent: NB.isNoEmpty(device) ? device.user_agent : null,
            is_active: true,
            last_activity: new Date(),
        })

        await this.loginHistoriesRepo.logAttempt({
            user_id: user.id,
            mobile_number,
            status: 1,
            reason: 'Login successful',
            user_agent: NB.isNoEmpty(device) ? device.user_agent : "",
            ip_address: NB.isNoEmpty(device) ? device.ip_address : "",
        })

        await this.usersRepo.updateLastLogin(user.id);

        const tokenPayload = {
            sub: user.id,
            session_id: (NB.isNoEmpty(savedSession) && savedSession.id) ? savedSession.id : null
        };
        const accessToken = this.appHelper.generateAccessToken(tokenPayload);

        return GrpcSuccessResponse(HttpStatus.OK, 'Login successful', {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                mobile_number: user.mobile_number,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        });
    }

    async refreshToken(operation: string, action: string, data: any) {

        if (!NB.isNoEmpty(data) || !NB.isNoEmpty(data.refresh_token)) {
            return GrpcErrorResponse(HttpStatus.BAD_REQUEST, 'Missing refresh token');
        }

        const { refresh_token } = data;

        const decode = this.appHelper.verifyRefreshToken(refresh_token);
        if (!NB.isNoEmpty(decode) || !decode.sub) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
        }

        const userId = decode.sub;

        const tokenHash = this.appHelper.hashToken(refresh_token);

        const storedToken = await this.refreshTokensRep.getTokenDatabyHashToken(tokenHash);
        if (!NB.isNoEmpty(storedToken)) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
        }

        const isValid = this.appHelper.verifyTokenHash(refresh_token, storedToken.token);
        if (!isValid) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid refresh token');
        }

        if (storedToken.revoked === 1) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Refresh token has been revoked');
        }

        if (storedToken.expires_at < new Date()) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Refresh token has expired');
        }

        const user = await this.usersRepo.getUserById(userId);
        if (!NB.isNoEmpty(user)) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'User not found');
        }
        if (!user.status) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'User is inactive');
        }

        const session: any = await this.sessionsRepo.getSessionByRefreshTokenId(storedToken.id);
        if (!NB.isNoEmpty(session) || session.is_active === 0) {
            return GrpcErrorResponse(
                HttpStatus.UNAUTHORIZED,
                'Associated session is inactive or terminated'
            );
        }

        await this.sessionsRepo.updateLastActivityByRefreshTokenId(storedToken.id);

        const tokenPayload = {
            sub: user.id,
            session_id: session.id
        }

        const newAccessToken = this.appHelper.generateAccessToken(tokenPayload);

        return GrpcSuccessResponse(HttpStatus.OK, 'Token refreshed successfully', {
            access_token: newAccessToken,
            refresh_token: refresh_token,
        });
    }

    async logout(operation: string, action: string, data: any) {

        if (!NB.isNoEmpty(data) || !NB.isNoEmpty(data.sub)) {
            return GrpcErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid token');
        }

        const { sub, session_id } = data;

        const session: any = await this.sessionsRepo.getSessionByUserId(sub, session_id);
        if (!NB.isNoEmpty(session)) {
            return GrpcErrorResponse(HttpStatus.NOT_FOUND, 'No active session found');
        }

        await this.refreshTokensRep.updateRefreshToken(session?.refresh_token_id, { revoked: 1 });

        await this.sessionsRepo.updateSession(session.id, {
            is_active: 0,
            logout_at: new Date(),
            last_activity: new Date(),
        });

        return GrpcSuccessResponse(HttpStatus.OK, 'Logout successful');
    }
}