// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from "react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../store";
import { Tab, Tabs } from "@mui/material";
import { Org } from "@/types/orgs";
import { useTranslation } from "react-i18next";
import TableViewContainer from "../components/TableViewContainer";
import OrgLdap from "../components/OrgLdap";


const OrgLdaps = () => {
  const { t } = useTranslation();
  const { permittedOrgs } = useAppSelector(state => state.profile.Profile);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(permittedOrgs.length > 0 && !selectedOrg) {
      setLoading(true);
      setSelectedOrg(permittedOrgs[0].ID);
    }
  }, [permittedOrgs]);

  const handleOrgClicked = (_: unknown, orgID: number) => {
    setLoading(true);
    setSelectedOrg(orgID)
  }

  const resolveLoading = () => setLoading(false);

  return (
    <TableViewContainer
      headline={t("Organization LDAP")}
      subtitle={t("ldap_sub")}
      href="https://docs.grommunio.com/admin/administration.html#ldap"
      loading={loading}
    >
      <Tabs value={selectedOrg} onChange={handleOrgClicked}>
        {permittedOrgs.map((org: Org) =>
          <Tab
            key={org.ID}
            value={org.ID}
            label={org.name}
            disabled={loading}
          />
        )}
      </Tabs>
      {selectedOrg && <OrgLdap orgID={selectedOrg} noHeader resolveLoading={resolveLoading}/>}
    </TableViewContainer>
  );
}

export default OrgLdaps;
