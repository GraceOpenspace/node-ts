export interface Config {
  port: number;
  destinationServers: string[];
}

export const config: Config = {
  port: Number(process.env.PORT) || 3003,
  destinationServers: process.env.DESTINATION_SERVERS
    ? process.env.DESTINATION_SERVERS.split(',').map((d) => d.trim())
    : [],
};
