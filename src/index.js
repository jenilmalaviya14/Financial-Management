require('dotenv').config()
const express = require("express");
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use('/user', require("./routes/user.route"));
app.use('/tenant', require("./routes/tenant.route"));
app.use('/role', require("./routes/role.route"));
app.use('/parentmenu', require("./routes/parentmenu.route"));
app.use('/childmenu', require("./routes/childmenu.route"));
app.use('/menu', require("./routes/menu.route"));
app.use('/company', require("./routes/company.route"));
app.use('/account', require("./routes/account.route"));
app.use('/common', require("./routes/common.route"));
app.use('/client', require("./routes/client.route"));
app.use('/transaction', require("./routes/transaction.route"));
app.use('/transfer', require("./routes/transfer.route"));
app.use('/dashboard', require("./routes/dashboard.route"));
app.use('/report', require("./routes/reports.route"));
app.use('/companyaccess', require("./routes/company_access.route"));
app.use('/companysetting', require("./routes/company_setting.route"));

app.use((req, res, next) => {
        next(new Error("Route not found!"));
});

app.listen(8080, async () => {
        console.log(`SERVER IS RUNNING PORT ${process.env.PORT}`);
});
