interface HlsSource {
  originalUrl: string
  resolutions: Record<string, string>
}

export default HlsSource