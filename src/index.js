require('dotenv').config()
const express = require("express");
const cors = require('cors');
const path = require('path');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')();

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());

app.use(express.urlencoded({ extended: false }))

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/*.js'];
const doc = {
        info: {
                title: 'Nodejs Express + MySQL API',
                description: 'Nodejs Express + MySQL API'
        },
        host: 'localhost:8080',
        schemes: ['http'],
        securityDefinitions: {
                bearerAuth: {
                        type: 'apiKey',
                        name: 'Authorization',
                        in: 'header'
                }
        },
        security: [
                {
                        bearerAuth: []
                }
        ]
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
        const swaggerDocument = require('./swagger-output.json');
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        app.use(express.static(path.join(__dirname, 'public')));

        app.use(require("./routes/user.route"));
        app.use(require("./routes/tenant.route"));
        app.use(require("./routes/role.route"));
        app.use(require("./routes/parentmenu.route"));
        app.use(require("./routes/childmenu.route"));
        app.use(require("./routes/menu.route"));
        app.use(require("./routes/company.route"));
        app.use(require("./routes/account.route"));
        app.use(require("./routes/common.route"));
        app.use(require("./routes/client.route"));
        app.use(require("./routes/transaction.route"));
        app.use(require("./routes/transfer.route"));
        app.use(require("./routes/dashboard.route"));
        app.use(require("./routes/reports.route"));
        app.use(require("./routes/company_access.route"));
        app.use(require("./routes/company_setting.route"));
        app.use(require("./routes/trasnaction_details.route"));

        app.use((req, res, next) => {
                res.status(404).json({ success: false, message: "Route not found!" });
        });

        const PORT = process.env.PORT;

        app.listen(PORT, () => {
                console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
        });

}).catch((err) => {
        console.error('Error generating Swagger documentation:', err);
});