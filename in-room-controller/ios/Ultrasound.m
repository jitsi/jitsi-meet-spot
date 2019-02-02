#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <QuietModemKit/QuietModemKit.h>

#import "Ultrasound.h"

@implementation Ultrasound

static QMFrameReceiver *receiver;
static QMFrameTransmitter *transmitter;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(play: (NSString *)message) {
  if (transmitter == nil) {
    QMTransmitterConfig *transmitterConfig = [[QMTransmitterConfig alloc] initWithKey:@"ultrasonic-experimental"];
    transmitter = [[QMFrameTransmitter alloc] initWithConfig:transmitterConfig];
  }
  
  NSString *frame_str = message;
  NSData *frame = [frame_str dataUsingEncoding:NSUTF8StringEncoding];
  [transmitter send:frame];
}

@end
