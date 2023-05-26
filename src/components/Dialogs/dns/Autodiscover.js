import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function Autodiscover({ onClose, dnsCheck, domain }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDNSDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      label="Autodiscover"
      field='autodiscover'
      subtitle="autodiscover_expl"
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    ${dnsCheck.externalIp}`}
        </pre>
        <pre>
          {`autodiscover.${domain.domainname || "example.at"}.    1    IN    CNAME    ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

Autodiscover.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default Autodiscover;