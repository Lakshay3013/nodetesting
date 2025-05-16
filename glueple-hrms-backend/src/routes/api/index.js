const express = require('express');
const authRoute = require('../../modules/auth/routes');
const employeeRoute = require('../../modules/employee/routes');
const apiRoutes = require('../../modules/api/routes')
const adminRoutes = require('../../modules/admin/routes')
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/employee',
    route: employeeRoute,
  },
  {
    path: '/api',
    route: apiRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


module.exports = router;
