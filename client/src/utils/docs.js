export const prioritizeDocsByLinkCount = (docId, a, b) => {
  const aHasLink = a.links.some(conn => conn.id === docId);
  const bHasLink = b.links.some(conn => conn.id === docId);

  if (aHasLink && !bHasLink) return -1;
  if (!aHasLink && bHasLink) return 1;
  return a.title.localeCompare(b.title);
};
