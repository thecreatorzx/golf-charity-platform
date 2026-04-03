import api from './clients';

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data);
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// User Profile & Dashboard
export const getDashboard = () => api.get('/user/dashboard');
export const updateProfile = (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) =>
  api.put('/user/profile', data);
export const uploadWinnerProof = (winnerId: string, proofUrl: string) =>
  api.post(`/user/winners/${winnerId}/proof`, { proofUrl });

// Scores
export const addScore = (data: { score: number; datePlayed: string }) =>
  api.post('/scores', data);
export const getScores = () => api.get('/scores');
export const deleteScore = (scoreId: string) => api.delete(`/scores/${scoreId}`);

// Subscriptions
export const initiateSubscription = (data: { plan: 'MONTHLY' | 'YEARLY' }) =>
  api.post('/subscriptions/initiate', data);
export const mockActivateSubscription = (data: {
  plan: 'MONTHLY' | 'YEARLY';
}) => api.post('/subscriptions/mock-activate', data);
export const cancelSubscription = () => api.post('/subscriptions/cancel');
export const getSubscriptionStatus = () => api.get('/subscriptions');
export const verifySubscription = (data: {
  plan: 'MONTHLY' | 'YEARLY';
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => api.post('/subscriptions/confirm', data);


// Charities
export const getCharities = (params?: { search?: string; }) =>
  api.get('/charities', { params });
export const getCharity = (id: string) => api.get(`/charities/${id}`);
export const selectCharity = (data: { charityId: string; percentage: number }) =>
  api.post('/charities/user/select', data);
export const getUserCharity = () => api.get('/charities/user/mine');
export const donate = (data: { charityId: string; amount: number }) =>
  api.post('/charities/donate', data);

// Draws
export const getDraws = () => api.get('/draws');
export const getDraw = (month: number, year: number) => api.get(`/draws/${month}/${year}`);

// Admin
export const adminGetUsers = () => api.get('/admin/users');
export const adminUpdateUserSubscription = (userId: string, status: string) =>
  api.put(`/admin/users/${userId}/subscription`, { status });
export const adminEditScore = (scoreId: string, data: { score: number; datePlayed: string }) =>
  api.put(`/admin/scores/${scoreId}`, data);
export const adminDeleteScore = (scoreId: string) => api.delete(`/admin/scores/${scoreId}`);
export const adminAddCharity = (data: object) => api.post('/charities', data);
export const adminEditCharity = (id: string, data: object) => api.put(`/charities/${id}`, data);
export const adminDeleteCharity = (id: string) => api.delete(`/charities/${id}`);
export const simulateDraw = (data: { month: number; year: number; algorithm: 'RANDOM' | 'WEIGHTED' }) =>
  api.post('/draws/simulate', data);
export const publishDraw = (data: { month: number; year: number; algorithm: 'RANDOM' | 'WEIGHTED' }) =>
  api.post('/draws/publish', data);
export const adminGetWinners = () => api.get('/admin/winners');
export const adminVerifyWinner = (winnerId: string, verificationStatus: 'APPROVED' | 'REJECTED') =>
  api.put(`/admin/winners/${winnerId}/verify`, { verificationStatus });
export const adminMarkWinnerPaid = (winnerId: string) =>
  api.put(`/admin/winners/${winnerId}/pay`);
export const adminGetAnalytics = () => api.get('/admin/analytics');