Pod::Spec.new do |s|
  s.name             = 'QuietModemKit'
  s.version          = '0.0.2'
  s.summary          = 'iOS framework for the Quiet Modem (data over sound)'
  s.homepage         = 'https://github.com/quiet/QuietModemKit'
  s.license          = { :type => 'BSD 3-Clause' }
  s.authors          = 'https://github.com/quiet/QuietModemKit/graphs/contributors'
  s.source           = s.source = { :git => 'git@quiet/QuietModemKit.git' }

  s.platform         = :ios, '10.0'

  s.vendored_frameworks = 'QuietModemKit.framework'
end

