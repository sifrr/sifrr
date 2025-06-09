import { SifrrServer } from '@/index';
import { join } from 'path';
import forge from 'node-forge';
import { writeFileSync } from 'fs';

function generateCACertificate() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const attrs = [
    { name: 'commonName', value: 'example.org' },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'California' },
    { name: 'localityName', value: 'San Francisco' },
    { name: 'organizationName', value: 'example.org' },
    { shortName: 'OU', value: 'Test' }
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    }
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  return {
    privateKey: keys.privateKey,
    publicKey: keys.publicKey,
    cert: cert
  };
}

function generateCertificate(
  ca: { privateKey: any; publicKey?: any; cert: any },
  commonName: string
) {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '02';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const attrs = [{ name: 'commonName', value: commonName }];
  cert.setSubject(attrs);
  cert.setIssuer(ca.cert.subject.attributes);
  cert.sign(ca.privateKey, forge.md.sha256.create());
  return {
    privateKey: keys.privateKey,
    cert: cert
  };
}

function pemEncodeCert(cert: any) {
  return forge.pki.certificateToPem(cert);
}

function pemEncodeKey(key: any) {
  return forge.pki.privateKeyToPem(key);
}

// uncomment when need to generate new certificate
// const ca = generateCACertificate();
// const caCertPem = pemEncodeCert(ca.cert);
// const serverCert = generateCertificate(ca, 'localhost');
// const serverCertPem = pemEncodeCert(serverCert.cert);
// const serverKeyPem = pemEncodeKey(serverCert.privateKey);
// writeFileSync(join(import.meta.dirname, './cert/server.ca'), caCertPem);
// writeFileSync(join(import.meta.dirname, './cert/server.key'), serverKeyPem);
// writeFileSync(join(import.meta.dirname, './cert/server.cert'), serverCertPem);

const sapp = new SifrrServer({
  ssl: true,
  cert_file_name: join(import.meta.dirname, './cert/server.cert'),
  key_file_name: join(import.meta.dirname, './cert/server.key'),
  ca_file_name: join(import.meta.dirname, './cert/server.ca')
});
sapp.folder('', join(import.meta.dirname, './public'));
export const SPORT = 6100;

sapp.listen(SPORT);

export default sapp;
