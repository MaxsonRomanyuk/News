'use strict';

export default ({ strapi }) => ({
  async log(
    action: string, 
    entity: string, 
    entityId: number, 
    user: any, 
    details: any = {}
  ) {
    try {
      const auditLog = await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          action,
          entity,
          entityId,
          user: user?.id || null,
          details: {
            ...details,
            userName: user?.username || 'Unknown',
            userEmail: user?.email || 'Unknown'
          },
          ipAddress: details.ipAddress || 'unknown',
          userAgent: details.userAgent || 'unknown'
        }
      });
      
      console.log(`Audit: ${action} ${entity}#${entityId} by ${user?.username || 'Unknown'}`);
      return auditLog;
    } catch (error) {
      console.error('Audit log error:', error);
      return null;
    }
  }
});