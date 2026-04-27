import LoginForm from './LoginForm'

type Props = { searchParams: Promise<{ registered?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { registered } = await searchParams
  return <LoginForm justRegistered={registered === '1'} />
}
