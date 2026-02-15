// helper pour répondre en HTML ou JSON selon la requête
function isHtml(req) {
  return req.headers.accept && req.headers.accept.includes('text/html');
}

module.exports = { isHtml };
