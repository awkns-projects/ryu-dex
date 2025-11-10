/**
 * Example Agent Descriptions for Pilot Page
 * These help users understand what they can build
 */

export interface PilotExample {
  name: string;
  description: string;
  connections: string[];
  icon: string;
  category: string;
}

export const PILOT_EXAMPLES: PilotExample[] = [
  {
    name: 'Social Media Manager',
    description: 'Automatically generate engaging social media posts with AI-created images and hashtags. Post daily to X, Instagram, and Facebook. Track engagement metrics and send weekly performance reports via email. Adjust posting strategy based on which content performs best.',
    connections: ['google', 'x', 'instagram', 'facebook'],
    icon: '📱',
    category: 'Marketing',
  },
  {
    name: 'Customer Support Assistant',
    description: 'Collect customer support tickets with name, email, and issue description. Automatically analyze sentiment and urgency level. Categorize issues by type and generate suggested responses. Send notifications to support team via Slack when high-priority tickets arrive. Track response times and customer satisfaction.',
    connections: ['google'],
    icon: '💬',
    category: 'Support',
  },
  {
    name: 'Lead Enrichment Engine',
    description: 'Import leads with company name and website URL. Research each company using web search to find industry, size, and key contacts. Score lead quality based on research findings. Enrich with social media profiles from LinkedIn. Send qualified leads to sales team via email with all enriched data. Update CRM automatically.',
    connections: ['google'],
    icon: '🎯',
    category: 'Sales',
  },
  {
    name: 'Content Calendar Planner',
    description: 'Plan blog posts and social content for the month. AI generates topics based on SEO keywords and trending topics. Create content briefs with target keywords, audience, and outline. Generate featured images for each post. Schedule posts across platforms. Send reminders when content is due. Track which topics get most engagement.',
    connections: ['google', 'x', 'instagram'],
    icon: '📅',
    category: 'Marketing',
  },
  {
    name: 'Expense Report Automator',
    description: 'Upload receipt images and extract details like merchant, amount, date, and category. Categorize expenses automatically (meals, travel, supplies, etc.). Flag receipts that need manager approval. Calculate monthly totals by category. Generate expense reports and send to accounting via email. Track reimbursement status.',
    connections: ['google'],
    icon: '💰',
    category: 'Finance',
  },
  {
    name: 'Trading Bot Monitor',
    description: 'Connect to crypto exchanges via CCXT. Monitor trading pairs and track price movements. Analyze technical indicators (RSI, MACD, moving averages). Execute trades based on strategy rules. Send Telegram alerts for important price movements. Track portfolio performance and P&L. Generate daily trading reports.',
    connections: ['ccxt', 'telegram'],
    icon: '📈',
    category: 'Finance',
  },
  {
    name: 'Email Campaign Analyzer',
    description: 'Connect to Gmail and fetch campaign emails. Analyze open rates, click-through rates, and responses. Identify which subject lines and content perform best. Generate insights on optimal sending times. Create A/B test recommendations. Send weekly campaign performance reports. Track subscriber engagement trends.',
    connections: ['google'],
    icon: '📧',
    category: 'Marketing',
  },
  {
    name: 'Product Review Monitor',
    description: 'Track product reviews from multiple sources. Analyze customer sentiment and extract key themes. Identify common complaints and feature requests. Generate priority lists for product improvements. Alert team via email when negative reviews spike. Create monthly review summaries with actionable insights.',
    connections: ['google'],
    icon: '⭐',
    category: 'Product',
  },
  {
    name: 'Instagram Content Scheduler',
    description: 'Create content ideas with topic and target audience. AI generates engaging captions with hashtags. Create AI-generated images matching brand style. Schedule posts for optimal engagement times. Track post performance metrics. Adjust posting schedule based on when followers are most active. Send analytics reports weekly.',
    connections: ['instagram', 'google'],
    icon: '📸',
    category: 'Social Media',
  },
  {
    name: 'Inventory Alert System',
    description: 'Track product inventory with current stock levels and minimum thresholds. Monitor stock daily and predict stockout dates. Calculate optimal reorder quantities. Send alerts via email when inventory is low. Generate purchase orders automatically. Track reorder history and supplier performance.',
    connections: ['google'],
    icon: '📦',
    category: 'Operations',
  },
  {
    name: 'Meeting Notes Organizer',
    description: 'Sync with Google Calendar to get meeting schedules. After each meeting, collect notes and action items. AI summarizes key decisions and tasks. Assign action items to team members. Send follow-up emails with meeting summary. Track completion of action items. Generate weekly team progress reports.',
    connections: ['google'],
    icon: '📝',
    category: 'Productivity',
  },
  {
    name: 'Competitor Price Tracker',
    description: 'Monitor competitor product prices across multiple websites. Track price changes and availability. Alert when competitors drop prices below yours. Analyze pricing trends and patterns. Suggest optimal pricing strategy. Send daily price alerts via email. Generate monthly competitive analysis reports.',
    connections: ['google'],
    icon: '💲',
    category: 'E-commerce',
  },
  {
    name: 'Recruitment Assistant',
    description: 'Collect candidate applications with resume and contact info. AI analyzes resumes and extracts skills, experience, and education. Score candidates based on job requirements. Schedule interviews and send calendar invites via Google Calendar. Send personalized emails to candidates. Track hiring pipeline and generate recruitment reports.',
    connections: ['google'],
    icon: '👥',
    category: 'HR',
  },
  {
    name: 'Blog SEO Optimizer',
    description: 'Import blog post topics and target keywords. Generate SEO-optimized titles and meta descriptions. Create content outlines with H2/H3 structure. Analyze keyword density and readability score. Generate featured images. Suggest internal linking opportunities. Track search rankings over time. Send SEO performance reports monthly.',
    connections: ['google'],
    icon: '🔍',
    category: 'Content',
  },
  {
    name: 'Event Registration Manager',
    description: 'Create event forms to collect attendee name, email, and preferences. Send confirmation emails via Gmail. Generate attendee badges and materials. Send reminders 1 week and 1 day before event. Track RSVPs and dietary requirements. Generate attendee lists and name tags. Send post-event surveys.',
    connections: ['google'],
    icon: '🎫',
    category: 'Events',
  },
  {
    name: 'Crypto Portfolio Tracker',
    description: 'Connect to multiple crypto exchanges via CCXT. Fetch portfolio balances and transaction history. Calculate total portfolio value in USD. Track profit/loss for each asset. Monitor price alerts for holdings. Generate tax reports with gains/losses. Send daily portfolio summaries via Telegram.',
    connections: ['ccxt', 'telegram'],
    icon: '₿',
    category: 'Crypto',
  },
  {
    name: 'Newsletter Publisher',
    description: 'Collect article ideas and research topics. AI generates engaging newsletter content with subject lines. Create featured images for each article. Schedule weekly newsletter sends via Gmail. Track open rates and click-through rates. Analyze which topics perform best. Automatically adjust content strategy based on engagement.',
    connections: ['google'],
    icon: '📰',
    category: 'Content',
  },
  {
    name: 'YouTube Content Planner',
    description: 'Plan video content with topic research and keyword analysis. Generate video scripts and descriptions. Create thumbnail concepts. Schedule upload reminders. Track video performance metrics. Analyze which types of content get most views. Send performance reports weekly via email.',
    connections: ['google'],
    icon: '🎬',
    category: 'Content',
  },
  {
    name: 'E-commerce Order Tracker',
    description: 'Sync orders from Shopify with customer details and order status. Send order confirmation emails via Gmail. Track shipping status and delivery dates. Alert customers when orders ship. Monitor delayed shipments and flag for follow-up. Generate daily sales reports. Calculate revenue metrics and trends.',
    connections: ['google'],
    icon: '🛍️',
    category: 'E-commerce',
  },
  {
    name: 'Appointment Scheduler',
    description: 'Create appointment booking forms with customer name, email, preferred date/time, and service type. Automatically schedule in Google Calendar. Send confirmation emails via Gmail. Send reminder emails 24 hours before appointments. Track no-shows and cancellations. Generate monthly appointment analytics and utilization reports.',
    connections: ['google'],
    icon: '📅',
    category: 'Business',
  },
  {
    name: 'Feedback Collection System',
    description: 'Collect customer feedback with rating, comments, and contact info. Analyze sentiment and extract key themes. Categorize feedback by product/service area. Flag negative feedback for immediate response. Generate response suggestions. Send thank-you emails via Gmail. Create monthly feedback summary reports with improvement recommendations.',
    connections: ['google'],
    icon: '💭',
    category: 'Product',
  },
  {
    name: 'Project Task Manager',
    description: 'Create project tasks with title, description, assignee, and due date. Automatically prioritize tasks by urgency and dependencies. Send task assignments via email. Track task completion status. Alert when tasks are overdue. Generate progress reports for stakeholders. Calculate project completion percentage and timeline predictions.',
    connections: ['google'],
    icon: '✅',
    category: 'Productivity',
  },
  {
    name: 'TikTok Growth Tracker',
    description: 'Connect to TikTok and fetch video performance data. Track follower growth over time. Analyze which content types perform best. Monitor trending hashtags in your niche. Send daily growth reports via Telegram. Suggest optimal posting times based on engagement patterns. Alert when videos go viral.',
    connections: ['tiktok', 'telegram'],
    icon: '📈',
    category: 'Social Media',
  },
  {
    name: 'Invoice Generator',
    description: 'Create invoices with client details, line items, amounts, and due dates. Calculate totals with tax automatically. Generate professional PDF invoices. Send invoices via Gmail to clients. Track payment status and send reminders for overdue invoices. Generate monthly revenue reports. Calculate outstanding receivables.',
    connections: ['google'],
    icon: '🧾',
    category: 'Finance',
  },
  {
    name: 'Competitor Analysis Bot',
    description: 'Track competitor websites and social media accounts. Monitor their content, pricing, and product launches. Analyze their marketing strategies and messaging. Extract key differentiators and positioning. Send weekly competitive intelligence reports via email. Alert when competitors make major changes. Generate strategic recommendations.',
    connections: ['google'],
    icon: '🔎',
    category: 'Business',
  },
  {
    name: 'Community Manager Bot',
    description: 'Monitor community posts and questions across X, Facebook, and Instagram. Analyze sentiment and identify urgent issues. Generate helpful response suggestions. Flag posts needing immediate attention. Track community engagement metrics. Send daily community health reports. Identify trending topics and frequently asked questions.',
    connections: ['google', 'x', 'facebook', 'instagram'],
    icon: '👥',
    category: 'Community',
  },
];

export function getRandomExample(): PilotExample {
  return PILOT_EXAMPLES[Math.floor(Math.random() * PILOT_EXAMPLES.length)];
}

export function getExamplesByCategory(category: string): PilotExample[] {
  return PILOT_EXAMPLES.filter(ex => ex.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(PILOT_EXAMPLES.map(ex => ex.category)));
}

