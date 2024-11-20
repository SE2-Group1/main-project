// import express from 'express';
// import request from 'supertest';
// import { DocumentRoutes } from '../../../src/routers/documentRoutes';

// // Mocking authenticator and controller
// jest.mock('../../../src/routers/auth', () => ({
//   isAdminOrUrbanPlanner: jest.fn().mockImplementation((req, res, next) => next()), // Mocking the authenticator
// }));

// jest.mock('../../../src/controllers/documentController', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       create: jest.fn().mockResolvedValue({
//         id_file: 1, // Reflecting the auto-increment ID
//         title: 'New Document',
//         desc: 'Document description',
//         scale: 'Text',
//         type: 'Others',
//         language: 'English',
//         pages: '10',
//         issuance_year: '2024',
//         issuance_month: '11',
//         issuance_day: '20',
//         id_area: 1, // Example area ID
//       }),
//       getAll: jest.fn().mockResolvedValue([
//         {
//           id_file: 1,
//           title: 'Document 1',
//           desc: 'Description 1',
//           scale: 'Text',
//           type: 'Others',
//           language: 'English',
//           pages: '5',
//           issuance_year: '2023',
//           issuance_month: '10',
//           issuance_day: '15',
//           id_area: 2,
//         },
//         {
//           id_file: 2,
//           title: 'Document 2',
//           desc: 'Description 2',
//           scale: 'Text',
//           type: 'Article',
//           language: 'Spanish',
//           pages: '20',
//           issuance_year: '2022',
//           issuance_month: '5',
//           issuance_day: '10',
//           id_area: 3,
//         },
//       ]),
//       getById: jest.fn().mockResolvedValue({
//         id_file: 1,
//         title: 'New Document',
//         desc: 'Document description',
//         scale: 'Text',
//         type: 'Report',
//         language: 'English',
//         pages: '10',
//         issuance_year: '2024',
//         issuance_month: '11',
//         issuance_day: '20',
//         id_area: 1,
//       }),
//       update: jest.fn().mockResolvedValue({
//         id_file: 1,
//         title: 'Updated Document',
//         desc: 'Updated description',
//         scale: 'Text',
//         type: 'Report',
//         language: 'English',
//         pages: '15',
//         issuance_year: '2024',
//         issuance_month: '11',
//         issuance_day: '21',
//         id_area: 1,
//       }),
//       delete: jest.fn().mockResolvedValue({ message: 'Document deleted' }),
//     };
//   });
// });

// describe('DocumentRoutes', () => {
//   let app: express.Application;
//   let documentRoutes: DocumentRoutes;
//   let isAdminOrUrbanPlanner: any;

//   beforeEach(() => {
//     app = express();
//     const authenticator = isAdminOrUrbanPlanner ;
//     documentRoutes = new DocumentRoutes(authenticator);
//     app.use('/documents', documentRoutes.getRouter());
//   });

//   describe('POST /documents', () => {
//     it('should create a new document', async () => {
//       const newDocument = {
//         title: 'New Document',
//         description: 'Document description',
//         scale: '1:1000',
//         type: 'Planning',
//         language: 'English',
//         pages: 10,
//         issuance_date: { year: '2024', month: '11', day: '19' },
//         id_area: 123,
//         stakeholders: ['Stakeholder 1'],
//         georeference: [100, 200],
//       };

//       const response = await request(app)
//         .post('/documents')
//         .send(newDocument)
//         .expect(201);

//       expect(response.body.id).toBe(1);
//       expect(response.body.title).toBe('New Document');
//       expect(response.body.description).toBe('Document description');
//     });

//     it('should return 400 if required fields are missing', async () => {
//       const response = await request(app)
//         .post('/documents')
//         .send({})
//         .expect(400);
//       expect(response.body.message).toBe('Missing required fields');
//     });
//   });

//   describe('GET /documents', () => {
//     it('should return all documents', async () => {
//       const response = await request(app).get('/documents').expect(200);
//       expect(response.body.length).toBe(2);
//       expect(response.body[0].title).toBe('Document 1');
//       expect(response.body[1].title).toBe('Document 2');
//     });
//   });

//   describe('GET /documents/:id', () => {
//     it('should return a document by id', async () => {
//       const response = await request(app).get('/documents/1').expect(200);
//       expect(response.body.id).toBe(1);
//       expect(response.body.title).toBe('New Document');
//     });

//     it('should return 404 if document is not found', async () => {
//       const response = await request(app).get('/documents/999').expect(404);
//       expect(response.body.message).toBe('Document not found');
//     });
//   });

//   describe('PUT /documents/:id', () => {
//     it('should update a document by id', async () => {
//       const updatedDocument = {
//         title: 'Updated Document',
//         description: 'Updated description',
//       };

//       const response = await request(app)
//         .put('/documents/1')
//         .send(updatedDocument)
//         .expect(200);

//       expect(response.body.id).toBe(1);
//       expect(response.body.title).toBe('Updated Document');
//       expect(response.body.description).toBe('Updated description');
//     });

//     it('should return 404 if document is not found', async () => {
//       const updatedDocument = {
//         title: 'Updated Document',
//         description: 'Updated description',
//       };

//       const response = await request(app)
//         .put('/documents/999')
//         .send(updatedDocument)
//         .expect(404);

//       expect(response.body.message).toBe('Document not found');
//     });
//   });

//   describe('DELETE /documents/:id', () => {
//     it('should delete a document by id', async () => {
//       const response = await request(app).delete('/documents/1').expect(200);
//       expect(response.body.message).toBe('Document deleted');
//     });

//     it('should return 404 if document is not found', async () => {
//       const response = await request(app).delete('/documents/999').expect(404);
//       expect(response.body.message).toBe('Document not found');
//     });
//   });
// });
