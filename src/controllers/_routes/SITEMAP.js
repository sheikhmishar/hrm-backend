const { employeeDocumentDirName } = require('../../configs')
const { default: env } = require('../../configs/env')

const root = '/api',
  staticRoot = '/static',
  usersRoot = `${root}/users`,
  employeesRoot = `${root}/employees`,
  attendancesRoot = `${root}/attendances`,
  companiesRoot = `${root}/companies`,
  departmentsRoot = `${root}/departments`,
  branchesRoot = `${root}/branches`,
  dutyTypesRoot = `${root}/duty-types`,
  salaryTypesRoot = `${root}/salary-types`,
  designationsRoot = `${root}/designations`

const rootParams = { id: ':id' }

const SITEMAP = {
  seed: !env.production ? `${root}/seed` : undefined,
  static: {
    _: staticRoot,
    employeeDocuments: `${staticRoot}/${employeeDocumentDirName}`
  },
  users: {
    _params: rootParams,
    _: usersRoot,
    postRegister: `${usersRoot}/register`,
    postLogin: `${usersRoot}/login`,
    get: usersRoot,
    getSelf: `${usersRoot}/self`,
    getById: `${usersRoot}/:id`,
    put: `${usersRoot}/:id`
  },
  employees: {
    _params: rootParams,
    _: employeesRoot,
    post: employeesRoot,
    postBulk: `${employeesRoot}/bulk`, // TODO:
    get: employeesRoot,
    getAssets: `${employeesRoot}/assets`,
    getById: `${employeesRoot}/:id`,
    put: `${employeesRoot}/:id`
  },
  attendances: {
    _params: { ...rootParams, employeeId: ':employeeId' },
    _: attendancesRoot,
    post: attendancesRoot,
    get: attendancesRoot,
    getByEmployeeId: `${attendancesRoot}/:employeeId`,
    put: `${attendancesRoot}/:id`
  },
  companies: {
    _params: rootParams,
    _: companiesRoot,
    post: companiesRoot,
    get: companiesRoot,
    getById: `${companiesRoot}/:id`,
    put: `${companiesRoot}/:id`
  },
  departments: {
    _params: rootParams,
    _: departmentsRoot,
    post: departmentsRoot,
    get: departmentsRoot,
    getById: `${departmentsRoot}/:id`,
    put: `${departmentsRoot}/:id`
  },
  branches: {
    _params: rootParams,
    _: branchesRoot,
    post: branchesRoot,
    get: branchesRoot,
    getById: `${branchesRoot}/:id`,
    put: `${branchesRoot}/:id`
  },
  dutyTypes: {
    _params: rootParams,
    _: dutyTypesRoot,
    post: dutyTypesRoot,
    get: dutyTypesRoot,
    getById: `${dutyTypesRoot}/:id`,
    put: `${dutyTypesRoot}/:id`
  },
  salaryTypes: {
    _params: rootParams,
    _: salaryTypesRoot,
    post: salaryTypesRoot,
    get: salaryTypesRoot,
    getById: `${salaryTypesRoot}/:id`,
    put: `${salaryTypesRoot}/:id`
  },
  designations: {
    _params: rootParams,
    _: designationsRoot,
    post: designationsRoot,
    get: designationsRoot,
    getById: `${designationsRoot}/:id`,
    put: `${designationsRoot}/:id`
  }
}

module.exports = SITEMAP
