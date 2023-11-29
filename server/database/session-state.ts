/*
All the state for a user in a session
*/

export class SessionState {
    constructor(
        public discordID: string,
        public username: string,
        public isProUser: boolean,
    ) {}
}