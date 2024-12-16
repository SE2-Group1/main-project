import express from 'express';

import ErrorHandler from './helper';
import { AreaRoutes } from './routers/areaRoutes';
import Authenticator from './routers/auth';
import { DocumentRoutes } from './routers/documentRoutes';
import { LanguageRoutes } from './routers/languageRoutes';
import { LinkTypeRoutes } from './routers/linkTypeRoutes';
import { ResourceRoutes } from './routers/resourceRoutes';
import { ScaleRoutes } from './routers/scalesRoutes';
import { StakeholderRoutes } from './routers/stakeholderRoutes';
import { TypeRoutes } from './routers/typeRoutes';
import { AuthRoutes, UserRoutes } from './routers/userRoutes';

const morgan = require('morgan');
const prefix = '/kiruna/api';

/**
 * Initializes the routes for the application.
 *
 * @remarks
 * This function sets up the routes for the application.
 * It defines the routes for the user, authentication, product, and cart resources.
 *
 * @param {express.Application} app - The express application instance.
 */
function initRoutes(app: express.Application) {
  app.use(morgan('dev')); // Log requests to the console
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ limit: '25mb', extended: true }));

  /**
   * The authenticator object is used to authenticate users.
   * It is used to protect the routes by requiring users to be logged in.
   * It is also used to protect routes by requiring users to have the correct role.
   * All routes must have the authenticator object in order to work properly.
   */
  const authenticator = new Authenticator(app);
  const userRoutes = new UserRoutes();
  const authRoutes = new AuthRoutes(authenticator);
  const documentRoutes = new DocumentRoutes(authenticator);
  const stakeholderRoutes = new StakeholderRoutes(authenticator);
  const scaleRoutes = new ScaleRoutes(authenticator);
  const typeRoutes = new TypeRoutes(authenticator);
  const languageRoutes = new LanguageRoutes(authenticator);
  const linkTypeRoutes = new LinkTypeRoutes(authenticator);
  const areaRoutes = new AreaRoutes(authenticator);
  const resourceRoutes = new ResourceRoutes(authenticator);

  /**
   * The routes for the user, authentication, product, proposal, and cart resources are defined here.
   */
  app.use(`${prefix}/users`, userRoutes.getRouter());
  app.use(`${prefix}/sessions`, authRoutes.getRouter());
  app.use(`${prefix}/documents`, documentRoutes.getRouter());
  app.use(`${prefix}/stakeholders`, stakeholderRoutes.getRouter());
  app.use(`${prefix}/scales`, scaleRoutes.getRouter());
  app.use(`${prefix}/types`, typeRoutes.getRouter());
  app.use(`${prefix}/languages`, languageRoutes.getRouter());
  app.use(`${prefix}/linktypes`, linkTypeRoutes.getRouter());
  app.use(`${prefix}/areas`, areaRoutes.getRouter());
  app.use(`${prefix}/resources`, resourceRoutes.getRouter());

  ErrorHandler.registerErrorHandler(app);
}

export default initRoutes;
