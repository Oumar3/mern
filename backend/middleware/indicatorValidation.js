import mongoose from 'mongoose';

// Validation middleware for indicator creation and update
export const validateIndicator = (req, res, next) => {
    const { code, name, programme, source } = req.body;

    // Check required fields
    if (!code || !name || !programme) {
        return res.status(400).json({ 
            error: 'Missing required fields: code, name, and programme are required' 
        });
    }

    // Validate programme ObjectId
    if (!mongoose.Types.ObjectId.isValid(programme)) {
        return res.status(400).json({ 
            error: 'Invalid programme ID format' 
        });
    }

    // Validate source array if provided
    if (source) {
        if (!Array.isArray(source)) {
            return res.status(400).json({ 
                error: 'Source must be an array of ObjectIds' 
            });
        }

        for (const sourceId of source) {
            if (!mongoose.Types.ObjectId.isValid(sourceId)) {
                return res.status(400).json({ 
                    error: 'Invalid source ID format in sources array' 
                });
            }
        }
    }

    // Validate uniteDeMesure if provided
    if (req.body.uniteDeMesure && !mongoose.Types.ObjectId.isValid(req.body.uniteDeMesure)) {
        return res.status(400).json({ 
            error: 'Invalid uniteDeMesure ID format' 
        });
    }

    // Validate metaData if provided (single ObjectId reference)
    if (req.body.metaData) {
        // Allow empty string to clear the reference
        if (req.body.metaData === "") {
            req.body.metaData = null;
        } else if (!mongoose.Types.ObjectId.isValid(req.body.metaData)) {
            return res.status(400).json({ 
                error: 'Invalid metaData ID format' 
            });
        }
    }

    next();
};

// Validation middleware for indicator data entries
export const validateIndicatorData = (req, res, next) => {
    const { data } = req.body;

    if (data && Array.isArray(data)) {
        const allowedGeoTypes = ['Global', 'Province', 'Departement', 'Commune'];
        const allowedAgeRanges = [
            '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', 
            '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+',
            '0-14', '15-49', '15-64', '18+', '25-64', 'Tout'
        ];
        const allowedGenders = ['Homme', 'Femme', 'Tout'];
        const allowedSocialCategories = ['Cadre supérieur', 'Cadre moyen/agent de maîtrise','Employé/Ouvrier', 'Manoeuvre','Travailleur indépendant','Patron', 'Aide familial/Apprenti','Tout'];

        for (const [index, dataEntry] of data.entries()) {
            // Validate geoLocation type
            if (dataEntry.geoLocation?.type && !allowedGeoTypes.includes(dataEntry.geoLocation.type)) {
                return res.status(400).json({ 
                    error: `Invalid geoLocation type at data index ${index}` 
                });
            }

            // Validate referenceId if geoLocation type is provided
            if (dataEntry.geoLocation?.referenceId && !mongoose.Types.ObjectId.isValid(dataEntry.geoLocation.referenceId)) {
                return res.status(400).json({ 
                    error: `Invalid geoLocation referenceId format at data index ${index}` 
                });
            }

            // Validate age range
            if (dataEntry.ageRange && !allowedAgeRanges.includes(dataEntry.ageRange)) {
                return res.status(400).json({ 
                    error: `Invalid ageRange at data index ${index}` 
                });
            }

            // Validate gender
            if (dataEntry.gender && !allowedGenders.includes(dataEntry.gender)) {
                return res.status(400).json({ 
                    error: `Invalid gender at data index ${index}` 
                });
            }

            // Validate social category
            if (dataEntry.socialCategory && !allowedSocialCategories.includes(dataEntry.socialCategory)) {
                return res.status(400).json({ 
                    error: `Invalid socialCategory at data index ${index}` 
                });
            }

            // Validate numeric fields
            const numericFields = ['ref_year', 'ref_value', 'target_year', 'target_value'];
            for (const field of numericFields) {
                if (dataEntry[field] !== undefined && (isNaN(dataEntry[field]) || dataEntry[field] === null)) {
                    return res.status(400).json({ 
                        error: `${field} must be a valid number at data index ${index}` 
                    });
                }
            }

            // Validate year ranges
            const currentYear = new Date().getFullYear();
            if (dataEntry.ref_year && (dataEntry.ref_year < 1900 || dataEntry.ref_year > currentYear + 50)) {
                return res.status(400).json({ 
                    error: `ref_year must be between 1900 and ${currentYear + 50} at data index ${index}` 
                });
            }

            if (dataEntry.target_year && (dataEntry.target_year < 1900 || dataEntry.target_year > currentYear + 50)) {
                return res.status(400).json({ 
                    error: `target_year must be between 1900 and ${currentYear + 50} at data index ${index}` 
                });
            }
        }
    }

    next();
};
