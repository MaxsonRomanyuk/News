export default ({ strapi }) => ({
  async getMeWithRole(ctx) {
    try {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Not authenticated');
      }
      
      // Получаем пользователя с populate role
      const userWithRole = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            role: {
              fields: ['id', 'name', 'description', 'type'] // Явно указываем поля
            }
          }
        }
      );
      
      // Форматируем ответ в понятную структуру
      const response = {
        id: userWithRole.id,
        username: userWithRole.username,
        email: userWithRole.email,
        role: userWithRole.role ? {
          id: userWithRole.role.id,
          name: userWithRole.role.name,
          type: userWithRole.role.type,
          description: userWithRole.role.description
        } : null
      };
      
      return response;
    } catch (error) {
      console.error('Error in getMeWithRole:', error);
      ctx.throw(500, 'Internal server error');
    }
  }
});