/*
 * Copyright @ 8x8 inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <AVFoundation/AVFoundation.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>

@interface AppInfo : NSObject<RCTBridgeModule>
@end

@implementation AppInfo

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSDictionary *)constantsToExport {
  NSDictionary<NSString *, id> *infoDictionary = [[NSBundle mainBundle] infoDictionary];
  
  // name
  NSString *name = infoDictionary[@"CFBundleDisplayName"];
  
  if (name == nil) {
    name = infoDictionary[@"CFBundleName"];
    if (name == nil) {
      name = @"";
    }
  }
  
  // version
  NSString *version = infoDictionary[@"CFBundleShortVersionString"];
  
  if (version == nil) {
    version = infoDictionary[@"CFBundleVersion"];
    if (version == nil) {
      version = @"";
    }
  }
  
  // build number
  NSString *buildNumber = infoDictionary[@"CFBundleVersion"];
  if (buildNumber == nil) {
    buildNumber = @"";
  }
  
  return @{
           @"buildNumber": buildNumber,
           @"name": name,
           @"version": version
           };
};

@end
