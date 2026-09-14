const WEBHOOK_URL = 'http://localhost:5678/webhook/f3c8af0a-52f7-4199-a48d-581e188dfbff';
const REVIEW_API_URL = '/api/review';

const storyInput = document.getElementById('storyKey');
const reviewButton = document.querySelector('.primary-btn');
const workspacePanel = document.getElementById('reviewWorkspace');
const workspaceText = document.getElementById('workspaceText');
const workspaceMessage = document.getElementById('workspaceMessage');
const tickerText = document.querySelector('.ticker-text');
const inputWrap = document.querySelector('.input-wrap');
const reportContent = document.getElementById('reportContent');
const analysisBadge = document.getElementById('analysisBadge');
const workspacePlaceholder = document.getElementById('workspacePlaceholder');
const storiesChecked = document.getElementById('storiesChecked');
const storiesCheckedStat = document.getElementById('storiesCheckedStat');
const invalidModal = document.getElementById('invalidModal');
const invalidModalOk = document.getElementById('invalidModalOk');
const invalidModalMessage = document.getElementById('invalidModalMessage');
const STORIES_CHECKED_KEY = 'logBookStoriesChecked';
const VALID_STORIES_KEY = 'logBookValidStories';
const INVALID_STORIES_KEY = 'logBookInvalidStories';
const JIRA_HISTORY_KEY = 'logBookJiraHistory';
const HISTORY_PAGE_SIZE = 5;
let historyPage = 0;

const statusMessages = [
  'Reading story key...',
  'Contacting Jira API...',
  'Evaluating description clarity...',
  'Synthesizing recommendations...'
];

let tickerInterval = null;
let tickerIndex = 0;

function getStoriesChecked() {
  return Number.parseInt(localStorage.getItem(STORIES_CHECKED_KEY) || '0', 10) || 0;
}

function getMetric(key) {
  return Number.parseInt(localStorage.getItem(key) || '0', 10) || 0;
}

function getJiraHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(JIRA_HISTORY_KEY) || '[]');
    return Array.isArray(history) ? history : [];
  } catch (error) {
    return [];
  }
}

function renderJiraHistory() {
  const history = getJiraHistory();
  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  historyPage = Math.min(historyPage, totalPages - 1);
  const start = historyPage * HISTORY_PAGE_SIZE;
  const visibleRows = history.slice(start, start + HISTORY_PAGE_SIZE);
  const historyBody = document.getElementById('jiraHistoryBody');
  const historyEmpty = document.getElementById('historyEmpty');
  const previousButton = document.getElementById('historyPrevious');
  const nextButton = document.getElementById('historyNext');

  historyBody.innerHTML = visibleRows.map((entry) => `
    <tr>
      <td>${entry.serialNumber}</td>
      <td><strong>${escapeHtml(entry.jiraKey)}</strong></td>
      <td><span class="history-status ${entry.status.toLowerCase()}">${entry.status}</span></td>
    </tr>
  `).join('');
  historyEmpty.hidden = history.length > 0;
  document.getElementById('historyPageLabel').textContent = `Page ${historyPage + 1} of ${totalPages}`;
  document.getElementById('historyRangeLabel').textContent = history.length
    ? `${start + 1}-${start + visibleRows.length} of ${history.length} reviews`
    : '0 reviews';
  previousButton.disabled = historyPage === 0;
  nextButton.disabled = historyPage >= totalPages - 1;
}

function recordJiraReview(jiraKey, status) {
  const history = getJiraHistory();
  history.push({
    serialNumber: history.length + 1,
    jiraKey: jiraKey || 'Not provided',
    status
  });
  localStorage.setItem(JIRA_HISTORY_KEY, JSON.stringify(history));
  historyPage = Math.floor((history.length - 1) / HISTORY_PAGE_SIZE);
  renderJiraHistory();
}

function updateStoriesChecked() {
  const count = getStoriesChecked();
  storiesChecked.textContent = count;
  storiesCheckedStat.textContent = count;
  document.getElementById('validStoriesStat').textContent = getMetric(VALID_STORIES_KEY);
  document.getElementById('invalidStoriesStat').textContent = getMetric(INVALID_STORIES_KEY);
}

function recordSuccessfulReview(storyKey) {
  const nextCount = getStoriesChecked() + 1;
  localStorage.setItem(STORIES_CHECKED_KEY, String(nextCount));
  localStorage.setItem(VALID_STORIES_KEY, String(getMetric(VALID_STORIES_KEY) + 1));
  recordJiraReview(storyKey, 'Valid');
  updateStoriesChecked();
}

function recordInvalidReview(storyKey) {
  localStorage.setItem(INVALID_STORIES_KEY, String(getMetric(INVALID_STORIES_KEY) + 1));
  recordJiraReview(storyKey, 'Invalid');
  updateStoriesChecked();
}

function isInvalidJiraError(error) {
  return error.status === 404 || /invalid|not found|does not exist|unknown jira|jira.*(key|number).*(invalid|not found|exist)/i.test(error.message || '');
}

function isInvalidJiraResult(result) {
  const resultText = getReviewText(result);
  return /jira.*(not found|does not exist|invalid)|((invalid|unknown).*(jira|story|issue))|issue.*not found/i.test(resultText);
}

function isValidStoryKey(storyKey) {
  return /^TES-\d+$/i.test(storyKey);
}

function showInvalidJiraModal(message) {
  invalidModalMessage.textContent = message || 'We could not find that Jira story. Check the key and try again.';
  invalidModal.hidden = false;
  invalidModalOk.focus();
}

function resetApplication() {
  clearStatusTimer();
  storyInput.value = '';
  storyInput.disabled = false;
  reviewButton.disabled = false;
  reviewButton.textContent = 'Review Story';
  resetValidationState();
  resetWorkspaceView();
  workspaceText.textContent = 'Enter a Jira key and click “Review Story” to start analysis.';
  setStatusText('Awaiting input');
  storyInput.focus();
}

function setStatusText(message) {
  tickerText.textContent = message;
}

function clearStatusTimer() {
  if (tickerInterval) {
    clearInterval(tickerInterval);
    tickerInterval = null;
  }
}

function startStatusTicker() {
  clearStatusTimer();
  tickerIndex = 0;
  setStatusText(statusMessages[tickerIndex]);
  tickerInterval = setInterval(() => {
    tickerIndex = (tickerIndex + 1) % statusMessages.length;
    setStatusText(statusMessages[tickerIndex]);
  }, 1500);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdown(markdown) {
  if (!markdown || !markdown.trim()) {
    return '<p>No analysis available.</p>';
  }

  const escaped = escapeHtml(markdown);
  const blocks = escaped.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  const rendered = blocks.map((block) => {
    if (block.startsWith('|') && block.includes('|')) {
      const rows = block
        .split('\n')
        .filter((row) => row.trim())
        .map((row) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));

      if (rows.length >= 2) {
        const header = rows[0].map((cell) => `<th>${formatInlineMarkdown(cell)}</th>`).join('');
        const body = rows.slice(1).map((row) => {
          const cells = row.map((cell) => `<td>${formatInlineMarkdown(cell)}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');

        return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
      }
    }

    if (/^```/.test(block)) {
      const code = block.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
      return `<pre><code>${formatInlineMarkdown(code)}</code></pre>`;
    }

    if (/^#{1,6}\s/.test(block)) {
      const match = block.match(/^(#{1,6})\s+(.*)$/);
      const level = match[1].length;
      const text = formatInlineMarkdown(match[2]);
      return `<h${level}>${text}</h${level}>`;
    }

    if (/^(?:[-*+]\s)/m.test(block)) {
      const items = block
        .split('\n')
        .filter((line) => /^[-*+]\s/.test(line))
        .map((line) => `<li>${formatInlineMarkdown(line.replace(/^[-*+]\s/, ''))}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }

    const paragraph = block
      .split('\n')
      .map((line) => formatInlineMarkdown(line.trim()))
      .join('<br>');

    return `<p>${paragraph}</p>`;
  }).join('');

  return rendered;
}

function normalizeResult(result) {
  if (typeof result === 'string') {
    return result;
  }

  if (Array.isArray(result)) {
    const joined = result.map((item) => JSON.stringify(item, null, 2)).join('\n\n');
    return joined;
  }

  if (result && typeof result === 'object') {
    return JSON.stringify(result, null, 2);
  }

  return String(result || 'Story review complete.');
}

function getReviewText(result) {
  if (typeof result === 'string') {
    return result;
  }

  if (Array.isArray(result)) {
    return result.map((item) => getReviewText(item)).filter(Boolean).join('\n\n');
  }

  if (result && typeof result === 'object') {
    return getReviewText(result.review || result.output || result.text || result.message || result);
  }

  return String(result || '');
}

function parseReviewRows(reviewText) {
  const lines = reviewText.split('\n').map((line) => line.trim()).filter(Boolean);
  const rows = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!lines[index].startsWith('|') || !lines[index + 1].startsWith('|')) {
      continue;
    }

    const tableLines = [];
    while (index < lines.length && lines[index].startsWith('|')) {
      tableLines.push(lines[index]);
      index += 1;
    }

    if (tableLines.length < 3) {
      continue;
    }

    const header = tableLines[0].toLowerCase();
    const hasScoreColumn = /score|point|rating/.test(header);
    const hasReviewColumn = /parameter|review|criteria/.test(header);

    if (!hasScoreColumn || !hasReviewColumn) {
      continue;
    }

    tableLines.slice(2).forEach((line) => {
      const cells = line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
      if (cells.length >= 3 && cells.some((cell) => cell)) {
        rows.push({
          reviewPoint: cells[0],
          description: cells[1],
          points: cells[cells.length - 1]
        });
      }
    });
  }

  return rows;
}

function renderAnalysisTable(result) {
  const reviewText = getReviewText(result);
  const rows = parseReviewRows(reviewText);

  if (!rows.length) {
    return `<div class="report-summary"><span>AI REVIEW</span><strong>Analysis received</strong></div><table class="analysis-table"><thead><tr><th scope="col">#</th><th scope="col">Review Points</th><th scope="col">Description</th><th scope="col">Points</th></tr></thead><tbody><tr><td>1</td><td>Reviewer output</td><td>${formatInlineMarkdown(reviewText || 'No analysis available.')}</td><td>—</td></tr></tbody></table>`;
  }

  const body = rows.map((row, index) => `
    <tr>
      <td class="serial-cell">${index + 1}</td>
      <td class="review-point-cell"><strong>${formatInlineMarkdown(row.reviewPoint)}</strong></td>
      <td>${formatInlineMarkdown(row.description)}</td>
      <td class="points-cell"><span>${formatInlineMarkdown(row.points)}</span></td>
    </tr>
  `).join('');

  return `<div class="report-summary"><span>AI REVIEW MATRIX</span><strong>${rows.length} quality dimensions evaluated</strong></div><div class="analysis-table-wrap"><table class="analysis-table"><thead><tr><th scope="col">#</th><th scope="col">Review Points</th><th scope="col">Description</th><th scope="col">Points</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function showReport(markdownText) {
  reportContent.innerHTML = renderAnalysisTable(markdownText);
  reportContent.hidden = false;
  workspacePlaceholder.classList.add('hidden');
  analysisBadge.classList.add('visible');
}

function resetWorkspaceView() {
  workspacePlaceholder.classList.remove('hidden');
  reportContent.hidden = true;
  reportContent.innerHTML = '';
  analysisBadge.classList.remove('visible');
  workspaceMessage.hidden = true;
  workspaceMessage.classList.remove('error');
  workspaceMessage.textContent = '';
}

function setErrorState(message) {
  inputWrap.classList.add('is-invalid');
  workspacePanel.classList.remove('is-loading');
  workspacePanel.classList.add('is-error');
  workspaceMessage.hidden = false;
  workspaceMessage.textContent = message;
  workspaceMessage.classList.add('error');
  workspaceText.textContent = 'A validation error occurred while reviewing the story.';
  reviewButton.disabled = false;
  storyInput.disabled = false;
  storyInput.focus();
  clearStatusTimer();
  setStatusText('Error encountered');
  setTimeout(() => workspacePanel.classList.remove('is-error'), 450);
}

function resetValidationState() {
  inputWrap.classList.remove('is-invalid');
  workspaceMessage.hidden = true;
  workspaceMessage.classList.remove('error');
  workspaceMessage.textContent = '';
  workspacePanel.classList.remove('is-error');
}

function startAnalysis() {
  resetValidationState();
  const storyKey = storyInput.value.trim();

  if (!storyKey) {
    recordInvalidReview(storyKey);
    showInvalidJiraModal('invalid JIRA no, kindly add valid number');
    return;
  }

  if (!isValidStoryKey(storyKey)) {
    recordInvalidReview(storyKey);
    showInvalidJiraModal('invalid JIRA no, kindly add valid number');
    return;
  }

  storyInput.disabled = true;
  reviewButton.disabled = true;
  reviewButton.textContent = 'Analyzing...';
  workspacePanel.classList.add('is-loading');
  workspaceText.textContent = 'Reviewing story ' + storyKey;
  setStatusText('Reading story key...');
  startStatusTicker();
  analysisBadge.classList.remove('visible');
  reportContent.hidden = true;
  workspacePlaceholder.classList.remove('hidden');

  const payload = {
    storyKey: storyKey,
    modules: ['Clarity & Grammar', 'Acceptance Criteria', 'Technical Feasibility']
  };

  fetch(REVIEW_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      if (!response.ok) {
        let errorMessage = 'The reviewer endpoint returned an error.';
        try {
          const errorResult = await response.json();
          errorMessage = [errorResult.message, errorResult.details]
            .filter(Boolean)
            .join(' ') || errorMessage;
        } catch (parseError) {
          // Keep the generic message when the proxy does not return JSON.
        }
        const requestError = new Error(errorMessage);
        requestError.status = response.status;
        throw requestError;
      }

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new Error('The reviewer service returned an empty response. Add a response body to the n8n workflow.');
      }

      let result;

      if (contentType.includes('application/json')) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error('The reviewer service returned invalid JSON.');
        }
      } else {
        result = responseText;
      }

      if (isInvalidJiraResult(result)) {
        const invalidResultError = new Error('invalid JIRA number');
        invalidResultError.isInvalidJira = true;
        throw invalidResultError;
      }

      workspacePanel.classList.remove('is-loading');
      reviewButton.disabled = false;
      storyInput.disabled = false;
      reviewButton.textContent = 'Review Story';
      clearStatusTimer();
      setStatusText('Analysis complete');
      showReport(result);
      recordSuccessfulReview(storyKey);
      workspaceMessage.hidden = false;
      workspaceMessage.classList.remove('error');
      workspaceMessage.textContent = 'Analysis completed successfully.';
    })
    .catch((error) => {
      console.error(error);
      if (isInvalidJiraError(error) || error.isInvalidJira) {
        recordInvalidReview(storyKey);
        showInvalidJiraModal('invalid JIRA no, kindly add valid number');
      }
      workspaceText.textContent = 'Connection failed. Please check the n8n webhook and try again.';
      workspaceMessage.hidden = false;
      workspaceMessage.classList.add('error');
      workspaceMessage.textContent = error.message || 'Unable to connect to the reviewer service.';
      workspacePanel.classList.remove('is-loading');
      workspacePanel.classList.add('is-error');
      reviewButton.disabled = false;
      storyInput.disabled = false;
      reviewButton.textContent = 'Review Story';
      clearStatusTimer();
      setStatusText('Connection error');
      setTimeout(() => workspacePanel.classList.remove('is-error'), 450);
    });
}

reviewButton.addEventListener('click', startAnalysis);

storyInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    startAnalysis();
  }
});

storyInput.addEventListener('input', () => {
  if (storyInput.value.trim()) {
    inputWrap.classList.remove('is-invalid');
  }
});

invalidModalOk.addEventListener('click', () => {
  invalidModal.hidden = true;
  resetApplication();
});

invalidModal.addEventListener('click', (event) => {
  if (event.target === invalidModal) {
    invalidModal.hidden = true;
    resetApplication();
  }
});

document.getElementById('historyPrevious').addEventListener('click', () => {
  historyPage -= 1;
  renderJiraHistory();
});

document.getElementById('historyNext').addEventListener('click', () => {
  historyPage += 1;
  renderJiraHistory();
});

updateStoriesChecked();
renderJiraHistory();
resetWorkspaceView();
