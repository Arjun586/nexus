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
};

export type RefreshData = {
  accessToken: string;
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
