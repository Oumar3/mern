// Migration script to convert old IndicatorFollowup documents to new structure
// Run this if you have existing followup data that needs to be migrated

import mongoose from 'mongoose';
import IndicatorFollowup from '../models/IndicatorFollowup.js';
import Indicator from '../models/Indicator.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateFollowups = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pnd');
    console.log('Connected to MongoDB');

    // Get all existing followups
    const followups = await IndicatorFollowup.find({});
    console.log(`Found ${followups.length} followups to migrate`);

    if (followups.length === 0) {
      console.log('No followups found to migrate');
      return;
    }

    // Check if migration is needed (if followups have old structure)
    const needsMigration = followups.some(f => f.data && !f.indicator);
    
    if (!needsMigration) {
      console.log('Followups already migrated or using new structure');
      return;
    }

    console.log('Starting migration...');

    for (const followup of followups) {
      try {
        // Skip if already migrated
        if (followup.indicator && followup.dataIndex !== undefined) {
          continue;
        }

        // Find the indicator that contains this data reference
        const indicators = await Indicator.find({});
        let found = false;

        for (const indicator of indicators) {
          const dataIndex = indicator.data.findIndex(d => d._id && d._id.toString() === followup.data);
          
          if (dataIndex !== -1) {
            // Update the followup with new structure
            await IndicatorFollowup.findByIdAndUpdate(followup._id, {
              $set: {
                indicator: indicator._id,
                dataIndex: dataIndex
              },
              $unset: {
                data: 1
              }
            });
            
            console.log(`Migrated followup ${followup._id} to reference indicator ${indicator._id} data index ${dataIndex}`);
            found = true;
            break;
          }
        }

        if (!found) {
          console.warn(`Could not find matching indicator data for followup ${followup._id} with data reference ${followup.data}`);
          // You might want to delete orphaned followups or handle them differently
          // await IndicatorFollowup.findByIdAndDelete(followup._id);
        }

      } catch (error) {
        console.error(`Error migrating followup ${followup._id}:`, error);
      }
    }

    console.log('Migration completed');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateFollowups();
}

export default migrateFollowups;
