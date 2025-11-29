export default (policyContext, config, { strapi }) => {
  const { user, params } = policyContext;

  if (user?.role?.name === 'editor') {
    return true;
  }

  if (!user) {
    return false;
  }

  return strapi.entityService.findOne('api::article.article', params.id, {
    populate: ['author']
  }).then(article => {
    if (!article) {
      return false;
    }

    return article.author?.id === user.id;
  });
};