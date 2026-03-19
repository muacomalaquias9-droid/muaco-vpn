export interface OpenVPNServer {
  id: string;
  name: string;
  country: string;
  operator: string;
  protocol: "udp" | "tcp";
  port: number;
  host: string;
  configUrl?: string;
  certificateUrl?: string;
  icon?: string;
  socialMedia?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export const ANGOLA_VPN_SERVERS: OpenVPNServer[] = [
  {
    id: "unitel-net-1",
    name: "Unitel NET",
    country: "Angola",
    operator: "Unitel",
    protocol: "udp",
    port: 1194,
    host: "vpn.unitel.ao",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663447126234/DRwRQefuFkw3P3fNqNh9Ah/unitel-logo-FKuS2KDV7UtHmyK4uW3YLk.webp",
    socialMedia: {
      website: "https://www.unitel.ao",
      facebook: "https://www.facebook.com/unitelangola",
      twitter: "https://twitter.com/unitelangola",
      instagram: "https://www.instagram.com/unitelangola",
    },
  },
  {
    id: "africell-01",
    name: "Africell 01",
    country: "Angola",
    operator: "Africell",
    protocol: "udp",
    port: 1194,
    host: "vpn1.africell.ao",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663447126234/DRwRQefuFkw3P3fNqNh9Ah/africell-logo-AeSwrR2XM8CzVk9WAatNL9.webp",
    socialMedia: {
      website: "https://www.africell.ao",
      facebook: "https://www.facebook.com/africellangola",
      twitter: "https://twitter.com/africellao",
      instagram: "https://www.instagram.com/africellangola",
    },
  },
  {
    id: "africell-02",
    name: "Africell 02",
    country: "Angola",
    operator: "Africell",
    protocol: "tcp",
    port: 443,
    host: "vpn2.africell.ao",
    icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663447126234/DRwRQefuFkw3P3fNqNh9Ah/africell-logo-AeSwrR2XM8CzVk9WAatNL9.webp",
    socialMedia: {
      website: "https://www.africell.ao",
      facebook: "https://www.facebook.com/africellangola",
      twitter: "https://twitter.com/africellao",
      instagram: "https://www.instagram.com/africellangola",
    },
  },
];

export const getServerById = (id: string): OpenVPNServer | undefined => {
  return ANGOLA_VPN_SERVERS.find((server) => server.id === id);
};

export const getServersByOperator = (operator: string): OpenVPNServer[] => {
  return ANGOLA_VPN_SERVERS.filter((server) => server.operator === operator);
};
