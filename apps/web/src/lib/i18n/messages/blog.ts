/**
 * Blog list / article strings.
 *
 * Terminal tokens (`ls --group-directories-first`, the pagination arrows,
 * raw visibility values like `public`) are part of the design language and
 * keep the same value in zh and en. The dev-only scope hint is the one prose
 * block. zh values must match the pre-i18n UI byte for byte (regression red
 * line).
 */
export interface BlogMessages {
  /** Pagination controls — terminal style, same value in zh and en. */
  prevPage: string;
  nextPage: string;
  pageInfo: (page: number, total: number) => string;
  paginationAria: string;
  /** Dev-only hint naming the current session's visibility scope. */
  devHintGuest: string;
  devHintAdmin: string;
  devHintVip: string;
  devHintMember: string;
}

export const blogZh: BlogMessages = {
  prevPage: '← prev',
  nextPage: 'next →',
  pageInfo: (page, total) => `page ${page} / ${total}`,
  paginationAria: 'Pagination',
  devHintGuest: '当前身份：游客；可见范围：public',
  devHintAdmin: '当前身份：admin；可见范围：全部已发布（含 password）',
  devHintVip: '当前身份：vip；可见范围：public/member/vip',
  devHintMember: '当前身份：member；可见范围：public/member',
};

export const blogEn: BlogMessages = {
  prevPage: '← prev',
  nextPage: 'next →',
  pageInfo: (page, total) => `page ${page} / ${total}`,
  paginationAria: 'Pagination',
  devHintGuest: 'Current identity: guest; visible scope: public',
  devHintAdmin:
    'Current identity: admin; visible scope: all published (including password)',
  devHintVip: 'Current identity: vip; visible scope: public/member/vip',
  devHintMember: 'Current identity: member; visible scope: public/member',
};
