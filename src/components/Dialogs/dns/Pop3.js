// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Pop3({ onClose, dnsCheck={}, domain={} }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="POP3(s) SRV"
      subtitle="pop3_expl"
      label1='POP3 check result'
      label2='POP3s check result'
      field1='pop3SRV'
      field2='pop3sSRV'
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    `}
          {dnsCheck.externalIp}
        </pre>
        <pre>
          {`_pop3s._tcp.${domain.domainname || "example.at"}.    1    IN    SRV    0 0 995 ${mxDomain}
_pop3._tcp.${domain.domainname || "example.at"}.     1    IN    SRV    0 0 110 ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

Pop3.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default Pop3;