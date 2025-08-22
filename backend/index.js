import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import institutionRoutes from './routes/institutionRoutes.js';
import organisationRoutes from './routes/organisationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import domaineRoutes from './routes/domaineRoutes.js';
import programmeRoutes from './routes/programmeRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import sourceRoutes from './routes/sourceRoutes.js';
import indicateurRoutes from './routes/indicateurRoutes.js';
import indicatorRoutes from './routes/indicatorRoutes.js';
import indicatorFollowupRoutes from './routes/indicatorFollowupRoutes.js';
import suiviIndicateurRoutes from './routes/suiviIndicateurRoutes.js';
import excelUploadRoutes from './routes/excelUploadRoutes.js';
import uniteDeMesureRoutes from './routes/uniteDeMesureRoutes.js';
import orientationRoutes from './routes/orientationRoutes.js';

import metaDataRoutes from './routes/metaDataRoutes.js';
import dataProducerRoutes from './routes/dataProducerRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';

import villageRoutes from './routes/Decoupage/villageRoutes.js';
import communeRoutes from './routes/Decoupage/communeRoutes.js';
import departementRoutes from './routes/Decoupage/departementRoutes.js';
import provinceRoutes from './routes/Decoupage/provinceRoutes.js';
import sousPrefectureRoutes from './routes/Decoupage/sousPrefectureRoutes.js';
import cantonRoutes from './routes/Decoupage/cantonRoutes.js';


// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/institutions', institutionRoutes);
//app.use('/api/upload', uploadRoutes);

app.use('/api/domaines', domaineRoutes);
app.use('/api/programmes', programmeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/indicateurs', indicateurRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/indicator-followups', indicatorFollowupRoutes);
app.use('/api/suivi-indicateurs', suiviIndicateurRoutes);
app.use('/api/excel-upload', excelUploadRoutes);
app.use('/api/unites-de-mesure', uniteDeMesureRoutes);
app.use('/api/orientations', orientationRoutes);
app.use('/api/organisations', organisationRoutes);

app.use('/api/meta-data', metaDataRoutes);
app.use('/api/data-producers', dataProducerRoutes);
app.use('/api/statistics', statisticsRoutes);

app.use('/api/decoupage/villages', villageRoutes);
app.use('/api/decoupage/communes', communeRoutes);
app.use('/api/decoupage/departements', departementRoutes);
app.use('/api/decoupage/provinces', provinceRoutes);
app.use('/api/decoupage/sous-prefectures', sousPrefectureRoutes);
app.use('/api/decoupage/cantons', cantonRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});