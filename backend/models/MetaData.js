import mongoose from "mongoose";

const metaDataSchema = new mongoose.Schema({
    // # - Numéro/Code de l'indicateur
    code: {
        type: String,
        required: true,
        unique: true
    },
    // Intitulé de l'indicateur
    name: {
        type: String,
        required: true
    },
    // Définition Internationale
    internationalDefinition: {
        type: String,
        required: false
    },
    // Définition nationale
    nationalDefinition: {
        type: String,
        required: false
    },
    // Thème/Domaine
    thematicArea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: false,
    },
    // Objectif / Finalité
    goal: {
        type: String,
        required: false
    },
    // Source principale des données
    mainDataSource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source',
        required: false
    },
    // Source de données primaire
    primaryDataSource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source',
        required: false
    },
    // Méthodologie de collecte utilisée
    dataCollectionMethod: {
        type: String,
        required: false
    },
    // Méthode de calcule
    calculationMethod: {
        type: String,
        required: false
    },
    // Unité de mesure
    measurementUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UniteDeMesure',
        required: false
    },
    // Population couverte
    coveredPopulation: {
        type: String,
        enum: ['Individus', 'Ménages', 'Entreprises', 'Autre'],
        required: false
    },
    // Couverture géographique
    geographicCoverage: {
        type: String,
        enum: ['National', 'Provincial', 'Departmental', 'Communal', 'Autre'],
        required: false
    },
    // Niveau de désagrégation disponible
    disaggregationLevel: [{
        type: String,
        enum: ['Région', 'Âge', 'Sexe', 'Autre'],
        required: false
    }],
    // Périodicité de publication
    publicationPeriodicity: {
        type: String,
        enum: ['Mensuelle', 'Trimestrielle', 'Semestrielle', 'Annuelle', 'Autre'],
        required: false
    },
    // Structure/Service responsable de production
    responsibleProductionStructure: {
        type: String,
        required: false
    },
    // Structure de mise en œuvre
    implementationStructure: {
        type: String,
        required: false
    },
    // Points focaux (plusieurs)
    focalPoints: [
        {
            name: { type: String, required: false },
            email: {
                type: String,
                required: false,
                validate: {
                    validator: function(v) {
                        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                    },
                    message: 'Please enter a valid email address'
                }
            },
            phone: { type: String, required: false }
        }
    ]
}, {
    timestamps: true
});

const MetaData = mongoose.model('MetaData', metaDataSchema);
export default MetaData;