import Indicator from "../models/Indicator.js";
import Programme from "../models/Programme.js";
import Source from "../models/Source.js";
import UniteDeMesure from "../models/UniteDeMesure.js";

export class IndicatorService {
    
    // Get indicators with pagination and search
    static async getIndicators(page = 1, limit = 10, search = '', filters = {}) {
        const skip = (page - 1) * limit;
        let query = {};

        // Add search functionality
        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        // Add filters
        if (filters.programme) {
            query.programme = filters.programme;
        }

        if (filters.uniteDeMesure) {
            query.uniteDeMesure = filters.uniteDeMesure;
        }

        if (filters.sources && filters.sources.length > 0) {
            query.source = { $in: filters.sources };
        }

        const total = await Indicator.countDocuments(query);
        const indicators = await Indicator.find(query)
            .populate('uniteDeMesure', 'code name')
            .populate('programme', 'code name objectif')
            .populate('source', 'name description url')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return {
            indicators,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                totalItems: total,
                perPage: limit
            }
        };
    }

    // Create indicator with relationship validation
    static async createIndicator(data) {
        // Validate programme exists
        if (data.programme) {
            const programme = await Programme.findById(data.programme);
            if (!programme) {
                throw new Error('Programme not found');
            }
        }

        // Validate uniteDeMesure exists if provided
        if (data.uniteDeMesure) {
            const unite = await UniteDeMesure.findById(data.uniteDeMesure);
            if (!unite) {
                throw new Error('UniteDeMesure not found');
            }
        }

        // Validate sources exist if provided
        if (data.source && data.source.length > 0) {
            const sources = await Source.find({ _id: { $in: data.source } });
            if (sources.length !== data.source.length) {
                throw new Error('One or more sources not found');
            }
        }

        // Check for duplicate code
        const existingCode = await Indicator.findOne({ code: data.code });
        if (existingCode) {
            throw new Error('An indicator with this code already exists');
        }

        // Check for duplicate name
        const existingName = await Indicator.findOne({ name: data.name });
        if (existingName) {
            throw new Error('An indicator with this name already exists');
        }

        const indicator = new Indicator(data);
        await indicator.save();
        
        // Populate the result
        return await Indicator.findById(indicator._id)
            .populate('uniteDeMesure', 'code name')
            .populate('programme', 'code name objectif')
            .populate('source', 'name description url');
    }

    // Update indicator with relationship validation
    static async updateIndicator(id, data) {
        const existingIndicator = await Indicator.findById(id);
        if (!existingIndicator) {
            throw new Error('Indicator not found');
        }

        // Validate programme exists
        if (data.programme) {
            const programme = await Programme.findById(data.programme);
            if (!programme) {
                throw new Error('Programme not found');
            }
        }

        // Validate uniteDeMesure exists if provided
        if (data.uniteDeMesure) {
            const unite = await UniteDeMesure.findById(data.uniteDeMesure);
            if (!unite) {
                throw new Error('UniteDeMesure not found');
            }
        }

        // Validate sources exist if provided
        if (data.source && data.source.length > 0) {
            const sources = await Source.find({ _id: { $in: data.source } });
            if (sources.length !== data.source.length) {
                throw new Error('One or more sources not found');
            }
        }

        // Check for duplicate code (excluding current indicator)
        if (data.code && data.code !== existingIndicator.code) {
            const existingCode = await Indicator.findOne({ 
                code: data.code, 
                _id: { $ne: id } 
            });
            if (existingCode) {
                throw new Error('An indicator with this code already exists');
            }
        }

        // Check for duplicate name (excluding current indicator)
        if (data.name && data.name !== existingIndicator.name) {
            const existingName = await Indicator.findOne({ 
                name: data.name, 
                _id: { $ne: id } 
            });
            if (existingName) {
                throw new Error('An indicator with this name already exists');
            }
        }

        const indicator = await Indicator.findByIdAndUpdate(id, data, { 
            new: true, 
            runValidators: true 
        })
        .populate('uniteDeMesure', 'code name')
        .populate('programme', 'code name objectif')
        .populate('source', 'name description url');

        return indicator;
    }

    // Delete indicator with cascade checks
    static async deleteIndicator(id) {
        const indicator = await Indicator.findById(id);
        if (!indicator) {
            throw new Error('Indicator not found');
        }

        // TODO: Add checks for related followup data if needed
        // const followups = await IndicatorFollowup.find({ indicator: id });
        // if (followups.length > 0) {
        //     throw new Error('Cannot delete indicator with existing followup data');
        // }

        await Indicator.findByIdAndDelete(id);
        return { message: 'Indicator deleted successfully' };
    }

    // Get indicator statistics
    static async getIndicatorStatistics() {
        const stats = await Indicator.aggregate([
            {
                $facet: {
                    totalIndicators: [{ $count: "count" }],
                    byProgramme: [
                        {
                            $group: {
                                _id: "$programme",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $lookup: {
                                from: "programmes",
                                localField: "_id",
                                foreignField: "_id",
                                as: "programme"
                            }
                        },
                        {
                            $unwind: "$programme"
                        },
                        {
                            $project: {
                                _id: 1,
                                count: 1,
                                programme: {
                                    code: 1,
                                    name: 1
                                }
                            }
                        }
                    ],
                    withMetaData: [
                        {
                            $match: {
                                metaData: { $exists: true, $ne: [] }
                            }
                        },
                        { $count: "count" }
                    ],
                    withData: [
                        {
                            $match: {
                                data: { $exists: true, $ne: [] }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        return {
            total: stats[0].totalIndicators[0]?.count || 0,
            byProgramme: stats[0].byProgramme || [],
            withMetaData: stats[0].withMetaData[0]?.count || 0,
            withData: stats[0].withData[0]?.count || 0
        };
    }
}
