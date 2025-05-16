const express = require('express');
const viewRoute = require('../../modules/view/routes');
const config = require('../../config/config');
const adminRoutes = require('../../modules/admin/routes')

const router = express.Router();

const defaultRoutes = [
  {
    path: '/administration',
    route: viewRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});



module.exports = router;
