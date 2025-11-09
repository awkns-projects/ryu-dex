import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface SubscriptionExpiringEmailProps {
  email: string;
  planName: string;
  expiryDate: string;
  locale?: string;
}

const translations = {
  'zh-TW': {
    subject: '您的訂閱即將到期',
    preview: '請及時續訂以確保服務不中斷',
    greeting: '親愛的',
    message: '方案將於',
    expiry: '到期',
    reminder: '為確保服務不中斷，請及時續訂。',
    button: '立即續訂',
  },
  en: {
    subject: 'Your Subscription is Expiring Soon',
    preview: 'Renew now to maintain uninterrupted service',
    greeting: 'Dear',
    message: 'Your',
    expiry: 'plan will expire on',
    reminder: 'Please renew in time to ensure uninterrupted service.',
    button: 'Renew Now',
  },
};

export const SubscriptionExpiringEmail = ({
  email,
  planName,
  expiryDate,
  locale = 'en',
}: SubscriptionExpiringEmailProps) => {
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={paragraph}>
              {t.greeting} {email}
            </Text>
            <Text style={paragraph}>
              {t.message} {planName} {t.expiry} {expiryDate}。
            </Text>
            <Text style={paragraph}>{t.reminder}</Text>
            <Button
              pX={20}
              pY={12}
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/#subscribe`}
            >
              {t.button}
            </Button>
            <Hr style={hr} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#000000',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '560px',
};

const box = {
  padding: '32px',
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#ffffff',
};

const button = {
  backgroundColor: '#fbbf24',
  backgroundImage: 'linear-gradient(to right, #fbbf24, #ec4899)',
  borderRadius: '9999px',
  fontWeight: '600',
  color: '#fff',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const hr = {
  borderColor: '#333333',
  margin: '26px 0',
};

export default SubscriptionExpiringEmail;

