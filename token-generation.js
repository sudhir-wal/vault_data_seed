const jwt = require('jsonwebtoken');

const jwtSecret = '337d83592843c5753d882c3243ad8241ee5a5782622075413c02d87d330862d8a4102f0fec3565a44bb9640f0b1565f4dccdff9af5f5a5c0b7ff7ad0406aec60';
const faaGeneratedToken = jwt.sign({
    id: '98765', // LDAP ID
    role: 1,
    extSys: 'FAA'
}, jwtSecret);
// const faaTokenSecretResult = await client.setSecret('faaApiAuthToken', faaGeneratedToken);
console.log(faaGeneratedToken);

const rdmsGeneratedToken = jwt.sign({
    id: 'westagilelabs', // LDAP ID
    role: 1,
    extSys: 'RDMS'
}, jwtSecret);
// const faaTokenSecretResult = await client.setSecret('faaApiAuthToken', rdmsGeneratedToken);
console.log(rdmsGeneratedToken);
