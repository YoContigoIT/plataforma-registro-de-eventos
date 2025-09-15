export const JWT_CONFIG = {
  accessTokenExpiration: "15m",
  refreshTokenExpiration: "30d",
};

export const secretAccessToken = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
export const secretRefreshToken = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
