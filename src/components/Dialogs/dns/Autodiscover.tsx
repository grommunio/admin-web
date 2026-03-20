// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import DefaultDNSDialog from './DefaultDNSDialog';
import { DNSDialogProps } from './types';


function Autodiscover({ onClose, dnsCheck, domain }: DNSDialogProps) {
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


export default Autodiscover;