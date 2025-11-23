export default {
  routes: [
    {
      method: 'GET',
      path: '/user/me-with-role',
      handler: 'user.getMeWithRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};