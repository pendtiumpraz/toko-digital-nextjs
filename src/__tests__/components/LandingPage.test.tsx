import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'

describe('Landing Page', () => {
  it('should render the hero section', () => {
    render(<Home />)

    const heading = screen.getByText('Platform Toko Online SaaS Terlengkap')
    expect(heading).toBeInTheDocument()

    const description = screen.getByText(/Buat toko online profesional dalam hitungan menit/i)
    expect(description).toBeInTheDocument()
  })

  it('should render the CTA button', () => {
    render(<Home />)

    const ctaButton = screen.getByText('Mulai Free Trial 14 Hari')
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/register')
  })

  it('should render navigation links', () => {
    render(<Home />)

    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should render all features', () => {
    render(<Home />)

    const features = [
      'Katalog Digital',
      'Integrasi WhatsApp',
      'Manajemen Keuangan',
      'AI Landing Page',
      'Custom Domain',
      'Manajemen Stok',
    ]

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })

  it('should render pricing tiers', () => {
    render(<Home />)

    const tiers = ['Starter', 'Professional', 'Enterprise']

    tiers.forEach(tier => {
      expect(screen.getByText(tier)).toBeInTheDocument()
    })
  })

  it('should display pricing correctly', () => {
    render(<Home />)

    expect(screen.getByText('Rp 99.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 299.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 999.000')).toBeInTheDocument()
  })

  it('should render most popular badge', () => {
    render(<Home />)

    expect(screen.getByText('Most popular')).toBeInTheDocument()
  })

  it('should render footer', () => {
    render(<Home />)

    const copyright = screen.getByText(/2024 Toko Digital. All rights reserved/i)
    expect(copyright).toBeInTheDocument()
  })

  it('should have social media links in footer', () => {
    render(<Home />)

    expect(screen.getByText('Facebook')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Twitter')).toBeInTheDocument()
  })

  it('should render free plan info', () => {
    render(<Home />)

    expect(screen.getByText('Free Plan')).toBeInTheDocument()
    expect(screen.getByText(/10 Produk • 100 MB Storage/i)).toBeInTheDocument()
  })
})