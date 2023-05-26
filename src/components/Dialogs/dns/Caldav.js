import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Caldav({ onClose, dnsCheck={}, domain={} }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="Caldav(s) SRV"
      subtitle="caldav_expl"
      label1='Caldav check result'
      label2='Caldavs check result'
      field1='caldavSRV'
      field2='caldavsSRV'
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    `}
          {dnsCheck.externalIp}
        </pre>
        <pre>
          {`_caldavs._tcp.${domain.domainname || "example.at"}.    1    IN    SRV    0 0 443 ${mxDomain}
_caldav._tcp.${domain.domainname || "example.at"}.     1    IN    SRV    0 0 443 ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

Caldav.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default Caldav;