export const DEVELOPMENT_ACCOUNT = {
  EMAIL: "defensive.bee.phfc@letterguard.net"
};

export const isDevelopmentUser = (email: string): boolean => {
  return email === DEVELOPMENT_ACCOUNT.EMAIL;
};