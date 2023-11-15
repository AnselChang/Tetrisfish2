/*
All the state for a user in a session
*/

export class SessionState {
    constructor(
        public accessToken: string,
        public refreshToken: string,
    ) {}
}