export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginData = {
  user: SafeUser;
  accessToken: string;
  expiresIn: number;
};

export type RefreshData = {
  accessToken: string;
  user: SafeUser;
  expiresIn: number;
};

export type RegisterResponse = {
  success: true;
  data: SafeUser;
};

export type LoginResponse = {
  success: true;
  message: string;
  data: LoginData;
};

export type RefreshResponse = {
  success: true;
  data: RefreshData;
};

export type LogoutResponse = {
  success: true;
  message: string;
};
