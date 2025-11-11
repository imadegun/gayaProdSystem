# Database Migration Guide

This guide covers the database migration process for gayaProdSystem from MySQL to PostgreSQL.

## Prerequisites

1. **MySQL Database Access**: Ensure you have access to the source MySQL database (gayafusionall schema)
2. **PostgreSQL Database**: Set up a PostgreSQL database instance
3. **Environment Variables**: Configure the following in your `.env` file:

```bash
# MySQL Source Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=gayafusionall

# PostgreSQL Target Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gayaprod_db?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Migration Steps

### Step 1: Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE gayaprod_db;
```

2. Update your `.env` file with the correct PostgreSQL connection string.

### Step 2: Generate Prisma Client

```bash
npm run db:generate
```

### Step 3: Push Database Schema

```bash
npm run db:push
```

This creates all the necessary tables in PostgreSQL.

### Step 4: Run Migration Script

```bash
npm run migrate
```

This script will:
- Connect to your MySQL database
- Migrate all reference tables (categories, colors, designs, etc.)
- Migrate all product data (11,000+ records)
- Create default users with sample data
- Validate the migration

### Step 5: Verification

After migration, you can:
- Open Prisma Studio: `npm run db:studio`
- Check data integrity
- Test the application

## Default Users Created

The migration creates these default users:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | Admin | admin@gayaprod.com |
| forming1 | password123 | Forming | forming@gayaprod.com |
| glaze1 | password123 | Glaze | glaze@gayaprod.com |
| qc1 | password123 | QC | qc@gayaprod.com |
| sales1 | password123 | Sales | sales@gayaprod.com |
| rnd1 | password123 | R&D | rnd@gayaprod.com |

## Troubleshooting

### Connection Issues

- **MySQL Connection Failed**: Check MySQL credentials and ensure MySQL server is running
- **PostgreSQL Connection Failed**: Verify PostgreSQL is running and credentials are correct

### Data Issues

- **Missing Tables**: Ensure the MySQL gayafusionall schema exists and has the expected tables
- **Data Corruption**: Check MySQL data integrity before migration
- **Duplicate Keys**: The script uses upsert operations to handle existing data

### Performance Issues

- **Large Dataset**: Migration of 11,000+ products may take several minutes
- **Memory Usage**: Ensure sufficient RAM for large data transfers
- **Network Timeout**: Increase connection timeouts if needed

## Rollback Procedure

If migration fails:

1. **Stop the Application**: Ensure no active connections
2. **Drop PostgreSQL Database**: `DROP DATABASE gayaprod_db;`
3. **Recreate Database**: `CREATE DATABASE gayaprod_db;`
4. **Fix Issues**: Address the root cause
5. **Retry Migration**: Run the migration script again

## Post-Migration Tasks

1. **Update Application Config**: Point application to PostgreSQL
2. **Test All Features**: Verify CRUD operations work correctly
3. **Performance Tuning**: Optimize queries and indexes
4. **Backup Strategy**: Set up automated PostgreSQL backups
5. **Monitoring**: Implement database monitoring and alerts

## Migration Validation Checklist

- [ ] All reference tables migrated (categories, colors, designs, materials, names, sizes, textures)
- [ ] All product records migrated (11,000+ items)
- [ ] Default users created and accessible
- [ ] Sample clients and production stages created
- [ ] Foreign key relationships intact
- [ ] No data loss or corruption
- [ ] Application connects and functions correctly
- [ ] Performance meets requirements (<3 seconds for complex queries)

## Support

For migration issues:
1. Check the console output for specific error messages
2. Verify database connectivity
3. Ensure sufficient permissions
4. Review the migration script logs
5. Contact the development team if issues persist