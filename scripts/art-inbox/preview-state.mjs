/** Resolve only the deployment built from the commit this drop just pushed. */
export async function preparePreview(
  request,
  {
    branch,
    sha,
    token,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    attempts = 60,
  }
) {
  delete request.previewUrl;
  request.previewSha = sha;
  try {
    if (!token) throw new Error('VERCEL_TOKEN is missing');
    const query = new URLSearchParams({
      app: 'imanolvillagomez',
      limit: '20',
      'meta-githubCommitRef': branch,
      'meta-githubCommitSha': sha,
    });
    let reason = 'No deployment appeared for the pushed commit';
    for (let i = 0; i < attempts; i++) {
      let deployments;
      try {
        const response = await fetchImpl(`https://api.vercel.com/v6/deployments?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`Vercel lookup returned HTTP ${response.status}`);
        deployments = (await response.json()).deployments;
      } catch (error) {
        reason = error.message;
      }
      const deployment = deployments?.find(
        (d) => d.meta?.githubCommitSha === sha && d.meta?.githubCommitRef === branch
      );
      if (deployment) {
        const state = deployment.state ?? deployment.readyState;
        if (state === 'READY' && deployment.url) {
          request.previewUrl = `https://${deployment.url}`;
          request.status = 'preview';
          delete request.error;
          return null;
        }
        if (state === 'ERROR' || state === 'CANCELED')
          throw new Error(`Vercel deployment for ${sha} is ${state}`);
        reason = `Vercel deployment for ${sha} is ${state ?? 'not ready'}${state === 'READY' ? ' without a URL' : ''}`;
      }
      if (i + 1 < attempts) await sleep(15_000);
    }
    throw new Error(reason);
  } catch (error) {
    request.status = 'failed';
    request.error =
      'The preview could not be prepared. Retry this drop. If it fails again, text Ian.';
    return error.message;
  }
}
