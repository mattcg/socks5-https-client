import * as https from 'https'
declare interface AgentOptions extends https.AgentOptions{
    socksHost?: string;
    socksPort?: number;
}
declare class Agent extends https.Agent{
    constructor(options?: AgentOptions);
    options: AgentOptions;
    socksHost: string;
    socksPort: number;
}
export = Agent
