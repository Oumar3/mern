import mongoose from "mongoose";

const indicatorSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    uniteDeMesure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UniteDeMesure',
        required: false,
    },
    programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true,
    },
    // Type d'indicateur: 'Indicateur d'impact socio-economique' ou 'Indicateur de resultat de programme'
    type: {
        type: String,
        enum: [
            "Indicateur d'impact socio-economique",
            "Indicateur de resultat de programme"
        ],
        required: true,
    },
    // Direction of polarity: 'positive' = good when increasing, 'negative' = good when decreasing
    polarityDirection: {
        type: String,
        enum: ['positive', 'negative'],
        required: false,
        default: 'positive'
    },
    source: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source',
        required: true
    }],
    // Reference to a single MetaData document
    metaData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MetaData',
        required: false
    },
    data: [{
        geoLocation: {
            type: {
                type: String,
                enum: ['Global', 'Province', 'Departement','Commune'],
                required: false
            },
            referenceId: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                refPath: 'data.geoLocation.type'
            }
        },
        ageRange: {
            type: String,
            enum: [
                '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', 
                '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+',
                '0-14', '15-49', '15-64', '18+', '25-64', 'Tout'
            ],
            required: false
        },
        gender: {
            type: String,
            enum: ['Homme', 'Femme', 'Tout'],
            required: false
        },
        residentialArea: {
            type: String,
            enum: ['Urbain','Rural','Tout'],
            required: false
        },
        socialCategory: {
            type: String,
            enum:['Cadre supérieur', 'Cadre moyen/agent de maîtrise','Employé/Ouvrier', 'Manoeuvre','Travailleur indépendant','Patron', 'Aide familial/Apprenti','Tout'],
            required: false
        },
        ref_year: { type: Number, required: false },
        ref_value: { type: Number, required: false },
        target_year: { type: Number, required: false },
        target_value: { type: Number, required: false },
    }],
}, {
    timestamps: true,
});

const Indicator = mongoose.model('Indicator', indicatorSchema);
export default Indicator;
