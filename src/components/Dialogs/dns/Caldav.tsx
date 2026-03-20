// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import DefaultDavDialog from './DefaultDavDialog';
import { DNSDialogProps } from './types';


function Caldav({ onClose, dnsCheck, domain }: DNSDialogProps) {
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


export default Caldav;