import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  // Update mode
  if (args.includes('--update')) {
    console.log('Running in UPDATE mode...');
    const getArg = (flag: string) => {
      const idx = args.indexOf(flag);
      return idx !== -1 ? args[idx + 1] : null;
    };

    const clientId = getArg('--clientId');
    const wabaId = getArg('--wabaId');
    const phoneNumberId = getArg('--phoneNumberId');
    const metaToken = getArg('--metaToken');
    const displayPhoneNumber = getArg('--displayPhoneNumber') || 'Unknown';

    if (!clientId || !wabaId || !phoneNumberId || !metaToken) {
      console.error('Error: Missing required arguments for update.');
      console.log('Usage: npx tsx get-waba-details.ts --update --clientId <id> --wabaId <id> --phoneNumberId <id> --metaToken <token> [--displayPhoneNumber <number>]');
      process.exit(1);
    }

    try {
      // 1. Update the Client's metaToken
      await prisma.client.update({
        where: { id: clientId },
        data: { metaToken },
      });

      // 2. Upsert the WabaAccount
      const account = await prisma.wabaAccount.upsert({
        where: { wabaId },
        update: {
          phoneNumberId,
          displayPhoneNumber,
          clientId,
          status: 'CONNECTED',
        },
        create: {
          wabaId,
          phoneNumberId,
          displayPhoneNumber,
          status: 'CONNECTED',
          clientId,
        }
      });

      console.log(`\nSuccess! WABA Account (wabaId: ${account.wabaId}) updated and linked to Client: ${clientId}`);
      console.log('The settings page should now reflect these details.');
    } catch (error) {
      console.error('Error updating WABA details:', error);
    } finally {
      await prisma.$disconnect();
    }
    return;
  }

  // Read mode (default)
  console.log('Retrieving data from the database...');

  try {
    const clientCount = await prisma.client.count();
    const userCount = await prisma.user.count();
    console.log(`\nDatabase Check:`);
    console.log(`- Found ${clientCount} Clients`);
    console.log(`- Found ${userCount} Users`);
    console.log(`(If these are 0, you might be connected to an empty database!)\n`);

    const wabaAccounts = await prisma.wabaAccount.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${wabaAccounts.length} WABA accounts.`);
    
    if (wabaAccounts.length > 0) {
      const outputFilename = 'old-waba-details.json';
      fs.writeFileSync(outputFilename, JSON.stringify(wabaAccounts, null, 2));
      console.log(`\nWABA details successfully exported to ${outputFilename}`);
      
      console.log('\nPreview of connected accounts:');
      wabaAccounts.slice(0, 5).forEach(account => {
        console.log(`- Client: ${account.client.name} (ID: ${account.clientId}) | WABA ID: ${account.wabaId} | Phone: ${account.displayPhoneNumber}`);
      });
      
      if (wabaAccounts.length > 5) {
        console.log(`... and ${wabaAccounts.length - 5} more.`);
      }
    } else {
      console.log('No WABA accounts found in the database.');
    }
  } catch (error) {
    console.error('Error fetching WABA details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
