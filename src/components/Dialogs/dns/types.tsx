import { DnsCheck } from "@/types/dns"
import { BaseDomain } from "@/types/domains"

export type DNSDialogProps = {
  onClose: () => void,
  dnsCheck: DnsCheck,
  domain: BaseDomain;
}