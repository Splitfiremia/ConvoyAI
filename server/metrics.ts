type Method = string;
type Path = string;
type Status = number;

interface RequestKey {
  method: Method;
  path: Path;
  status: Status;
}

function keyOf(k: RequestKey): string {
  return `${k.method}|${k.path}|${k.status}`;
}

const requestsTotal = new Map<string, number>();
const durationSum = new Map<string, number>();
const durationCount = new Map<string, number>();

export function recordRequest(method: Method, path: Path, status: Status, durationMs: number) {
  const key = keyOf({ method, path, status });
  requestsTotal.set(key, (requestsTotal.get(key) || 0) + 1);

  const durKey = `${method}|${path}`;
  durationSum.set(durKey, (durationSum.get(durKey) || 0) + durationMs);
  durationCount.set(durKey, (durationCount.get(durKey) || 0) + 1);
}

export function getPrometheusMetrics(): string {
  const lines: string[] = [];

  lines.push('# HELP app_requests_total Total number of HTTP requests');
  lines.push('# TYPE app_requests_total counter');
  for (const [k, count] of requestsTotal.entries()) {
    const [method, path, status] = k.split('|');
    lines.push(`app_requests_total{method="${escapeLabel(method)}",path="${escapeLabel(path)}",status="${status}"} ${count}`);
  }

  lines.push('# HELP app_request_duration_ms_sum Total request duration in milliseconds');
  lines.push('# TYPE app_request_duration_ms_sum counter');
  for (const [k, sum] of durationSum.entries()) {
    const [method, path] = k.split('|');
    lines.push(`app_request_duration_ms_sum{method="${escapeLabel(method)}",path="${escapeLabel(path)}"} ${sum}`);
  }

  lines.push('# HELP app_request_duration_ms_count Total number of requests measured for duration');
  lines.push('# TYPE app_request_duration_ms_count counter');
  for (const [k, cnt] of durationCount.entries()) {
    const [method, path] = k.split('|');
    lines.push(`app_request_duration_ms_count{method="${escapeLabel(method)}",path="${escapeLabel(path)}"} ${cnt}`);
  }

  return lines.join('\n') + '\n';
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

