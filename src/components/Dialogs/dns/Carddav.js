import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Carddav({ onClose, dnsCheck={}, domain={} }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="Carddav(s) SRV"
      subtitle="carddav_expl"
      label1='Carddav check result'
      label2='Carddavs check result'
      field1='carddavSRV'
      field2='carddavsSRV'
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    `}
          {dnsCheck.externalIp}
        </pre>
        <pre>
          {`_carddavs._tcp.${domain.domainname || "example.at"}.    1    IN    SRV    0 0 443 ${mxDomain}
_carddav._tcp.${domain.domainname || "example.at"}.     1    IN    SRV    0 0 443 ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

Carddav.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default Carddav;